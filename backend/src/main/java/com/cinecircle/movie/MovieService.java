package com.cinecircle.movie;

import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinecircle.common.ApiException;
import com.cinecircle.movie.MovieDtos.MovieDetails;
import com.cinecircle.movie.MovieDtos.MoviePage;
import com.cinecircle.review.ReviewRepository;

@Service
public class MovieService {

    public static final Set<String> BROWSE_CATEGORIES = Set.of("popular", "top_rated", "now_playing", "upcoming");

    private final TmdbClient tmdbClient;
    private final MovieRepository movieRepository;
    private final ReviewRepository reviewRepository;

    public MovieService(TmdbClient tmdbClient, MovieRepository movieRepository, ReviewRepository reviewRepository) {
        this.tmdbClient = tmdbClient;
        this.movieRepository = movieRepository;
        this.reviewRepository = reviewRepository;
    }

    public MoviePage search(String query, int page, Integer year) {
        if (query == null || query.isBlank()) {
            throw ApiException.badRequest("Search query is required");
        }
        if (page < 1 || page > 500) {
            throw ApiException.badRequest("Page must be between 1 and 500");
        }
        if (year != null && (year < 1888 || year > 2100)) {
            throw ApiException.badRequest("Year must be between 1888 and 2100");
        }
        return tmdbClient.search(query.trim(), page, year);
    }

    public MoviePage browse(String category, int page) {
        if (!BROWSE_CATEGORIES.contains(category)) {
            throw ApiException.badRequest("Unknown category: " + category);
        }
        if (page < 1 || page > 500) {
            throw ApiException.badRequest("Page must be between 1 and 500");
        }
        return tmdbClient.browse(category, page);
    }

    @Transactional(readOnly = true)
    public MovieDetails details(long tmdbId) {
        Double average = reviewRepository.averageRatingForMovie(tmdbId);
        long count = reviewRepository.countByMovieTmdbId(tmdbId);
        return tmdbClient.details(tmdbId, average, count);
    }

    /**
     * Returns the local reference for a movie, creating it from the external service on first use.
     */
    @Transactional
    public Movie getOrCreateReference(long tmdbId) {
        return movieRepository.findById(tmdbId)
                .orElseGet(() -> movieRepository.save(tmdbClient.fetchReference(tmdbId)));
    }
}
