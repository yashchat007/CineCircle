package com.cinecircle.movie;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinecircle.movie.MovieDtos.MoviePage;
import com.cinecircle.movie.MovieDtos.MovieSummary;
import com.cinecircle.review.ReviewRepository;
import com.cinecircle.tracking.WatchedRepository;
/**
 * Practical personalized discovery based on genres from the user's watched and reviewed movies.
 */
@Service
public class RecommendationService {

    private static final int GENRE_SAMPLE = 5;

    private final TmdbClient tmdbClient;
    private final WatchedRepository watchedRepository;
    private final ReviewRepository reviewRepository;
    public RecommendationService(TmdbClient tmdbClient, WatchedRepository watchedRepository,
                                 ReviewRepository reviewRepository) {
        this.tmdbClient = tmdbClient;
        this.watchedRepository = watchedRepository;
        this.reviewRepository = reviewRepository;
    }

    @Transactional(readOnly = true)
    public MoviePage forUser(Long userId, int page) {
        Set<Long> seen = new HashSet<>();
        watchedRepository.findByUserIdOrderByWatchedAtDesc(userId).stream()
                .map(e -> e.getMovie().getTmdbId()).forEach(seen::add);
        reviewRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(r -> r.getMovie().getTmdbId()).forEach(seen::add);

        List<Long> recent = watchedRepository.findByUserIdOrderByWatchedAtDesc(userId).stream()
                .map(e -> e.getMovie().getTmdbId())
                .limit(GENRE_SAMPLE)
                .toList();
        if (recent.isEmpty()) {
            recent = reviewRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                    .map(r -> r.getMovie().getTmdbId())
                    .limit(GENRE_SAMPLE)
                    .toList();
        }
        if (recent.isEmpty()) {
            return tmdbClient.browse("popular", page);
        }

        Map<Long, Integer> genreScores = new HashMap<>();
        for (Long tmdbId : recent) {
            for (var genre : tmdbClient.movieGenres(tmdbId)) {
                genreScores.merge(genre.id(), 1, Integer::sum);
            }
        }
        String topGenres = genreScores.entrySet().stream()
                .sorted((a, b) -> Integer.compare(b.getValue(), a.getValue()))
                .limit(2)
                .map(e -> String.valueOf(e.getKey()))
                .collect(Collectors.joining(","));

        MoviePage pageResult = topGenres.isBlank()
                ? tmdbClient.browse("popular", page)
                : tmdbClient.discoverByGenres(topGenres, page);

        List<MovieSummary> filtered = pageResult.results().stream()
                .filter(m -> !seen.contains(m.tmdbId()))
                .toList();
        return new MoviePage(pageResult.page(), pageResult.totalPages(), pageResult.totalResults(), filtered);
    }
}
