package com.cinecircle.notification;

import java.time.Instant;

import com.cinecircle.user.UserSummary;

public record NotificationResponse(Long id, NotificationType type, UserSummary actor, Long referenceId,
                                   String message, boolean read, Instant createdAt) {

    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(notification.getId(), notification.getType(),
                UserSummary.from(notification.getActor()), notification.getReferenceId(),
                notification.getMessage(), notification.isRead(), notification.getCreatedAt());
    }
}
