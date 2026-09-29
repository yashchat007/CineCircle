package com.cinecircle.notification;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinecircle.common.ApiException;
import com.cinecircle.follow.FollowRepository;
import com.cinecircle.review.Review;
import com.cinecircle.user.User;
import com.cinecircle.user.UserRepository;

@Service
public class NotificationService {

    static final int PAGE_SIZE = 30;

    private final NotificationRepository notificationRepository;
    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, FollowRepository followRepository,
                               UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.followRepository = followRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> list(Long userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId, PageRequest.of(0, PAGE_SIZE))
                .stream()
                .map(NotificationResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public long unreadCount(Long userId) {
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }

    @Transactional
    public void markRead(Long userId, long notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> ApiException.notFound("Notification not found"));
        if (!n.getRecipient().getId().equals(userId)) {
            throw ApiException.forbidden("Not your notification");
        }
        n.markRead();
        notificationRepository.save(n);
    }

    @Transactional
    public void markAllRead(Long userId) {
        notificationRepository.markAllRead(userId);
    }

    @Transactional
    public void newFollower(User followed, User follower) {
        if (followed.getId().equals(follower.getId())) {
            return;
        }
        save(followed, follower, NotificationType.NEW_FOLLOWER, follower.getId(),
                follower.getDisplayName() + " started following you");
    }

    @Transactional
    public void reviewLiked(Review review, User liker) {
        User author = review.getUser();
        if (author.getId().equals(liker.getId())) {
            return;
        }
        save(author, liker, NotificationType.REVIEW_LIKED, review.getId(),
                liker.getDisplayName() + " liked your review of " + review.getMovie().getTitle());
    }

    @Transactional
    public void reviewCommented(Review review, User commenter, long commentId) {
        User author = review.getUser();
        if (author.getId().equals(commenter.getId())) {
            return;
        }
        save(author, commenter, NotificationType.REVIEW_COMMENTED, commentId,
                commenter.getDisplayName() + " commented on your review of " + review.getMovie().getTitle());
    }

    @Transactional
    public void followedUserReviewed(Review review) {
        User author = review.getUser();
        String message = author.getDisplayName() + " reviewed " + review.getMovie().getTitle();
        for (Long followerId : followRepository.findFollowerIds(author.getId())) {
            if (followerId.equals(author.getId())) {
                continue;
            }
            save(userRepository.getReferenceById(followerId), author, NotificationType.FOLLOWED_USER_REVIEWED,
                    review.getId(), message);
        }
    }

    private void save(User recipient, User actor, NotificationType type, Long referenceId, String message) {
        notificationRepository.save(new Notification(recipient, actor, type, referenceId, message));
    }
}
