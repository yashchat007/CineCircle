package com.cinecircle.tracking;

import java.time.Instant;

import com.cinecircle.movie.MovieDtos.MovieRef;
import com.cinecircle.review.ReviewResponse;

public final class TrackingDtos {

    private TrackingDtos() {
    }

    public record WatchlistItem(MovieRef movie, Instant addedAt) {

        public static WatchlistItem from(WatchlistEntry entry) {
            return new WatchlistItem(MovieRef.from(entry.getMovie()), entry.getAddedAt());
        }
    }

    public record WatchedItem(MovieRef movie, Instant watchedAt) {

        public static WatchedItem from(WatchedEntry entry) {
            return new WatchedItem(MovieRef.from(entry.getMovie()), entry.getWatchedAt());
        }
    }

    /** The signed-in user's relationship with a single movie. */
    public record MovieStatus(boolean inWatchlist, boolean watched, Instant watchedAt, ReviewResponse review) {
    }
}
