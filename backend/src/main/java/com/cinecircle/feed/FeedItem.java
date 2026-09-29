package com.cinecircle.feed;

import java.time.Instant;

import com.cinecircle.list.MovieListEntry;
import com.cinecircle.movie.MovieDtos.MovieRef;
import com.cinecircle.review.Review;
import com.cinecircle.tracking.WatchedEntry;
import com.cinecircle.user.UserSummary;

/**
 * Movie activity from a followed user.
 */
public record FeedItem(String id, Type type, UserSummary user, MovieRef movie, Long reviewId, Integer rating,
                       String body, Long listId, String listName, long likeCount, long commentCount,
                       Instant occurredAt) {

    public enum Type {
        WATCHED, REVIEWED, LIST_ADDED
    }

    public static FeedItem from(WatchedEntry entry) {
        return new FeedItem("watched-" + entry.getId(), Type.WATCHED, UserSummary.from(entry.getUser()),
                MovieRef.from(entry.getMovie()), null, null, null, null, null, 0, 0, entry.getWatchedAt());
    }

    public static FeedItem from(Review review, long likeCount, long commentCount) {
        return new FeedItem("review-" + review.getId(), Type.REVIEWED, UserSummary.from(review.getUser()),
                MovieRef.from(review.getMovie()), review.getId(), review.getRating(), review.getBody(),
                null, null, likeCount, commentCount, review.getCreatedAt());
    }

    public static FeedItem from(MovieListEntry entry) {
        return new FeedItem("list-" + entry.getId(), Type.LIST_ADDED, UserSummary.from(entry.getList().getUser()),
                MovieRef.from(entry.getMovie()), null, null, null, entry.getList().getId(),
                entry.getList().getName(), 0, 0, entry.getAddedAt());
    }
}
