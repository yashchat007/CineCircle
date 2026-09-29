package com.cinecircle.movie;

import java.time.LocalDate;
import java.util.List;

public final class MovieDtos {

    private MovieDtos() {
    }

    /** Minimal movie reference used inside user activity (watchlist, watched, reviews, feed). */
    public record MovieRef(Long tmdbId, String title, String posterPath, LocalDate releaseDate) {

        public static MovieRef from(Movie movie) {
            return new MovieRef(movie.getTmdbId(), movie.getTitle(), movie.getPosterPath(), movie.getReleaseDate());
        }
    }

    /** A movie in search/browse results. */
    public record MovieSummary(Long tmdbId, String title, String overview, String posterPath, LocalDate releaseDate,
                               Double voteAverage) {
    }

    public record MoviePage(int page, int totalPages, int totalResults, List<MovieSummary> results) {
    }

    public record Genre(Long id, String name) {
    }

    public record MovieDetails(Long tmdbId, String title, String tagline, String overview, String posterPath,
                               String backdropPath, LocalDate releaseDate, Integer runtime, List<Genre> genres,
                               String originalLanguage, String status, Double voteAverage, Integer voteCount,
                               Double communityRating, long communityReviewCount) {
    }
}
