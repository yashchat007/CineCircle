package com.cinecircle.follow;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinecircle.common.ApiException;
import com.cinecircle.notification.NotificationService;
import com.cinecircle.user.User;

@Service
public class FollowService {

    private final FollowRepository followRepository;
    private final NotificationService notificationService;

    public FollowService(FollowRepository followRepository, NotificationService notificationService) {
        this.followRepository = followRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public boolean isFollowing(Long followerId, Long followingId) {
        return followRepository.existsByFollowerIdAndFollowingId(followerId, followingId);
    }

    @Transactional
    public void follow(User follower, User target) {
        if (follower.getId().equals(target.getId())) {
            throw ApiException.badRequest("You cannot follow yourself");
        }
        if (!isFollowing(follower.getId(), target.getId())) {
            followRepository.save(new Follow(follower, target));
            notificationService.newFollower(target, follower);
        }
    }

    @Transactional
    public void unfollow(Long followerId, Long targetId) {
        followRepository.findByFollowerIdAndFollowingId(followerId, targetId).ifPresent(followRepository::delete);
    }
}
