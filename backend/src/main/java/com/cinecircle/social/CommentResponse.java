package com.cinecircle.social;

import java.time.Instant;

import com.cinecircle.user.UserSummary;

public record CommentResponse(Long id, UserSummary user, String body, Instant createdAt, Instant updatedAt) {

    public static CommentResponse from(ReviewComment comment) {
        return new CommentResponse(comment.getId(), UserSummary.from(comment.getUser()), comment.getBody(),
                comment.getCreatedAt(), comment.getUpdatedAt());
    }
}
