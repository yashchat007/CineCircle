package com.cinecircle.review;

import java.time.Instant;

import com.cinecircle.movie.MovieDtos.MovieRef;
import com.cinecircle.user.UserSummary;

public record ReviewResponse(Long id, UserSummary user, MovieRef movie, int rating, String body, Instant createdAt,
                             Instant updatedAt, long likeCount, long commentCount, boolean likedByViewer) {

    public static ReviewResponse from(Review review) {
        return from(review, 0, 0, false);
    }

    public static ReviewResponse from(Review review, long likeCount, long commentCount, boolean likedByViewer) {
        return new ReviewResponse(review.getId(), UserSummary.from(review.getUser()), MovieRef.from(review.getMovie()),
                review.getRating(), review.getBody(), review.getCreatedAt(), review.getUpdatedAt(),
                likeCount, commentCount, likedByViewer);
    }
}
