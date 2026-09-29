package com.cinecircle.user;

import java.time.Instant;

/**
 * The signed-in user's own account details.
 */
public record AccountResponse(Long id, String username, String email, String displayName, String bio,
                              Instant createdAt) {

    public static AccountResponse from(User user) {
        return new AccountResponse(user.getId(), user.getUsername(), user.getEmail(), user.getDisplayName(),
                user.getBio(), user.getCreatedAt());
    }
}
