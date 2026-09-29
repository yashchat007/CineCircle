package com.cinecircle.movie;

import java.net.URI;
import java.net.http.HttpClient;
import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.function.Function;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriBuilder;

import com.cinecircle.common.ApiException;
import com.cinecircle.config.AppProperties;
import com.cinecircle.movie.MovieDtos.Genre;
import com.cinecircle.movie.MovieDtos.MovieDetails;
import com.cinecircle.movie.MovieDtos.MoviePage;
import com.cinecircle.movie.MovieDtos.MovieSummary;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

/**
 * Client for The Movie Database (TMDB) API, the external movie information service.
 */
@Component
public class TmdbClient {

    private static final Logger log = LoggerFactory.getLogger(TmdbClient.class);
    private static final int MAX_PAGE = 500;
    private static final int MAX_ATTEMPTS = 3;
    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(5);
    private static final Duration READ_TIMEOUT = Duration.ofSeconds(10);

    private final RestClient restClient;
    private final boolean configured;

    public TmdbClient(RestClient.Builder builder, AppProperties properties) {
        String token = properties.tmdb().apiToken();
        this.configured = token != null && !token.isBlank();
        HttpClient httpClient = HttpClient.newBuilder()
                .version(HttpClient.Version.HTTP_1_1)
                .connectTimeout(CONNECT_TIMEOUT)
                .build();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(READ_TIMEOUT);
        this.restClient = builder
                .requestFactory(requestFactory)
                .baseUrl(properties.tmdb().baseUrl())
                .defaultHeader("Authorization", "Bearer " + (configured ? token.trim() : ""))
                .defaultHeader("Accept", "application/json")
                .build();
    }

    public MoviePage search(String query, int page, Integer year) {
        TmdbPage result = get(uri -> {
            var builder = uri.path("/search/movie")
                    .queryParam("query", query)
                    .queryParam("include_adult", false)
                    .queryParam("page", clampPage(page));
            if (year != null) {
                builder.queryParam("primary_release_year", year);
            }
            return builder.build();
        }, TmdbPage.class);
        return toPage(result);
    }

    public MoviePage discoverByGenres(String genreIds, int page) {
        TmdbPage result = get(uri -> uri.path("/discover/movie")
                .queryParam("with_genres", genreIds)
                .queryParam("sort_by", "popularity.desc")
                .queryParam("include_adult", false)
                .queryParam("page", clampPage(page))
                .build(), TmdbPage.class);
        return toPage(result);
    }

    public List<Genre> movieGenres(long tmdbId) {
        TmdbDetails d = get(uri -> uri.path("/movie/{id}").build(tmdbId), TmdbDetails.class);
        if (d.genres() == null) {
            return List.of();
        }
        return d.genres().stream().map(g -> new Genre(g.id(), g.name())).toList();
    }

    public MoviePage browse(String category, int page) {
        TmdbPage result = get(uri -> uri.path("/movie/{category}")
                .queryParam("page", clampPage(page))
                .build(category), TmdbPage.class);
        return toPage(result);
    }

    public MovieDetails details(long tmdbId, Double communityRating, long communityReviewCount) {
        TmdbDetails d = get(uri -> uri.path("/movie/{id}").build(tmdbId), TmdbDetails.class);
        List<Genre> genres = d.genres() == null ? List.of()
                : d.genres().stream().map(g -> new Genre(g.id(), g.name())).toList();
        return new MovieDetails(d.id(), d.title(), blankToNull(d.tagline()), d.overview(), d.posterPath(),
                d.backdropPath(), parseDate(d.releaseDate()), d.runtime(), genres, d.originalLanguage(), d.status(),
                d.voteAverage(), d.voteCount(), communityRating, communityReviewCount);
    }

    public Movie fetchReference(long tmdbId) {
        TmdbDetails d = get(uri -> uri.path("/movie/{id}").build(tmdbId), TmdbDetails.class);
        return new Movie(d.id(), d.title(), d.posterPath(), parseDate(d.releaseDate()));
    }

    private <T> T get(Function<UriBuilder, URI> uri, Class<T> type) {
        if (!configured) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Movie service is not configured. Set the TMDB_API_TOKEN environment variable.");
        }
        for (int attempt = 1; ; attempt++) {
            try {
                return fetch(uri, type);
            } catch (ResourceAccessException ex) {
                if (attempt >= MAX_ATTEMPTS) {
                    log.error("TMDB request failed after {} attempts", attempt, ex);
                    throw new ApiException(HttpStatus.BAD_GATEWAY, "Movie service is unavailable right now");
                }
                log.warn("TMDB connection failed (attempt {}), retrying: {}", attempt, ex.getMessage());
                backoff(attempt);
            } catch (RestClientException ex) {
                log.error("TMDB request failed", ex);
                throw new ApiException(HttpStatus.BAD_GATEWAY, "Movie service is unavailable right now");
            }
        }
    }

    private static void backoff(int attempt) {
        try {
            Thread.sleep(200L * attempt);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Movie service is unavailable right now");
        }
    }

    private <T> T fetch(Function<UriBuilder, URI> uri, Class<T> type) {
        T body = restClient.get()
                .uri(uri)
                .retrieve()
                .onStatus(HttpStatusCode::isError, (request, response) -> {
                    int status = response.getStatusCode().value();
                    if (status == 404) {
                        throw ApiException.notFound("Movie not found");
                    }
                    log.error("TMDB responded with HTTP {}", status);
                    if (status == 401) {
                        throw new ApiException(HttpStatus.BAD_GATEWAY, "Movie service rejected the API token");
                    }
                    throw new ApiException(HttpStatus.BAD_GATEWAY, "Movie service request failed");
                })
                .body(type);
        if (body == null) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Movie service returned no data");
        }
        return body;
    }

    private static MoviePage toPage(TmdbPage page) {
        List<MovieSummary> results = page.results() == null ? List.of() : page.results().stream()
                .map(r -> new MovieSummary(r.id(), r.title(), r.overview(), r.posterPath(),
                        parseDate(r.releaseDate()), r.voteAverage()))
                .toList();
        return new MoviePage(page.page(), Math.min(page.totalPages(), MAX_PAGE), page.totalResults(), results);
    }

    private static int clampPage(int page) {
        return Math.max(1, Math.min(page, MAX_PAGE));
    }

    private static LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException ex) {
            return null;
        }
    }

    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    record TmdbPage(int page, int totalPages, int totalResults, List<TmdbResult> results) {
    }

    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    record TmdbResult(Long id, String title, String overview, String posterPath, String releaseDate,
                      Double voteAverage) {
    }

    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    record TmdbGenre(Long id, String name) {
    }

    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    record TmdbDetails(Long id, String title, String tagline, String overview, String posterPath,
                       String backdropPath, String releaseDate, Integer runtime, List<TmdbGenre> genres,
                       String originalLanguage, String status, Double voteAverage, Integer voteCount) {
    }
}
