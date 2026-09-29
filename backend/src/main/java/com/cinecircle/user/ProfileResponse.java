package com.cinecircle.user;

import java.time.Instant;

/**
 * Public profile information, as seen by the signed-in viewer.
 */
public record ProfileResponse(Long id, String username, String displayName, String bio, Instant createdAt,
                              long watchedCount, long reviewCount, long followerCount, long followingCount,
                              long listCount, boolean self, boolean following) {
}
