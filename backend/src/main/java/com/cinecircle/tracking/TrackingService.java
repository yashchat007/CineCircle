package com.cinecircle.tracking;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinecircle.movie.Movie;
import com.cinecircle.movie.MovieService;
import com.cinecircle.review.ReviewRepository;
import com.cinecircle.review.ReviewResponse;
import com.cinecircle.tracking.TrackingDtos.MovieStatus;
import com.cinecircle.tracking.TrackingDtos.WatchedItem;
import com.cinecircle.tracking.TrackingDtos.WatchlistItem;
import com.cinecircle.user.User;

@Service
public class TrackingService {

    private final WatchlistRepository watchlistRepository;
    private final WatchedRepository watchedRepository;
    private final ReviewRepository reviewRepository;
    private final MovieService movieService;

    public TrackingService(WatchlistRepository watchlistRepository, WatchedRepository watchedRepository,
                           ReviewRepository reviewRepository, MovieService movieService) {
        this.watchlistRepository = watchlistRepository;
        this.watchedRepository = watchedRepository;
        this.reviewRepository = reviewRepository;
        this.movieService = movieService;
    }

    @Transactional(readOnly = true)
    public List<WatchlistItem> watchlist(Long userId) {
        return watchlistRepository.findByUserIdOrderByAddedAtDesc(userId).stream().map(WatchlistItem::from).toList();
    }

    @Transactional
    public WatchlistItem addToWatchlist(User user, long tmdbId) {
        Optional<WatchlistEntry> existing = watchlistRepository.findByUserIdAndMovieTmdbId(user.getId(), tmdbId);
        if (existing.isPresent()) {
            return WatchlistItem.from(existing.get());
        }
        Movie movie = movieService.getOrCreateReference(tmdbId);
        return WatchlistItem.from(watchlistRepository.save(new WatchlistEntry(user, movie)));
    }

    @Transactional
    public void removeFromWatchlist(Long userId, long tmdbId) {
        watchlistRepository.findByUserIdAndMovieTmdbId(userId, tmdbId).ifPresent(watchlistRepository::delete);
    }

    @Transactional(readOnly = true)
    public List<WatchedItem> watched(Long userId) {
        return watchedRepository.findByUserIdOrderByWatchedAtDesc(userId).stream().map(WatchedItem::from).toList();
    }

    /**
     * Marks a movie as watched. A watched movie no longer belongs on the "watch later" list.
     */
    @Transactional
    public WatchedItem markWatched(User user, long tmdbId) {
        Optional<WatchedEntry> existing = watchedRepository.findByUserIdAndMovieTmdbId(user.getId(), tmdbId);
        if (existing.isPresent()) {
            return WatchedItem.from(existing.get());
        }
        Movie movie = movieService.getOrCreateReference(tmdbId);
        WatchedEntry entry = watchedRepository.save(new WatchedEntry(user, movie));
        removeFromWatchlist(user.getId(), tmdbId);
        return WatchedItem.from(entry);
    }

    @Transactional
    public void unmarkWatched(Long userId, long tmdbId) {
        watchedRepository.findByUserIdAndMovieTmdbId(userId, tmdbId).ifPresent(watchedRepository::delete);
    }

    @Transactional(readOnly = true)
    public MovieStatus status(Long userId, long tmdbId) {
        boolean inWatchlist = watchlistRepository.existsByUserIdAndMovieTmdbId(userId, tmdbId);
        Optional<WatchedEntry> watched = watchedRepository.findByUserIdAndMovieTmdbId(userId, tmdbId);
        ReviewResponse review = reviewRepository.findByUserIdAndMovieTmdbId(userId, tmdbId)
                .map(ReviewResponse::from)
                .orElse(null);
        return new MovieStatus(inWatchlist, watched.isPresent(),
                watched.map(WatchedEntry::getWatchedAt).orElse(null), review);
    }
}
