package com.cinecircle.user;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinecircle.common.ApiException;
import com.cinecircle.follow.FollowRepository;
import com.cinecircle.follow.FollowService;
import com.cinecircle.list.MovieListRepository;
import com.cinecircle.review.ReviewRepository;
import com.cinecircle.tracking.WatchedRepository;

@Service
public class UserService {

    static final int SEARCH_LIMIT = 20;

    private final UserRepository userRepository;
    private final WatchedRepository watchedRepository;
    private final ReviewRepository reviewRepository;
    private final FollowRepository followRepository;
    private final MovieListRepository movieListRepository;
    private final FollowService followService;

    public UserService(UserRepository userRepository, WatchedRepository watchedRepository,
                       ReviewRepository reviewRepository, FollowRepository followRepository,
                       MovieListRepository movieListRepository, FollowService followService) {
        this.userRepository = userRepository;
        this.watchedRepository = watchedRepository;
        this.reviewRepository = reviewRepository;
        this.followRepository = followRepository;
        this.movieListRepository = movieListRepository;
        this.followService = followService;
    }

    @Transactional(readOnly = true)
    public User getByUsername(String username) {
        return userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> ApiException.notFound("User not found"));
    }

    @Transactional(readOnly = true)
    public ProfileResponse profile(String username, Long viewerId) {
        User user = getByUsername(username);
        boolean self = user.getId().equals(viewerId);
        return new ProfileResponse(user.getId(), user.getUsername(), user.getDisplayName(), user.getBio(),
                user.getCreatedAt(), watchedRepository.countByUserId(user.getId()),
                reviewRepository.countByUserId(user.getId()),
                followRepository.countByFollowingId(user.getId()),
                followRepository.countByFollowerId(user.getId()),
                movieListRepository.countByUserId(user.getId()),
                self, !self && followService.isFollowing(viewerId, user.getId()));
    }

    @Transactional(readOnly = true)
    public List<UserSummary> search(String query, Long viewerId) {
        if (query == null || query.isBlank()) {
            throw ApiException.badRequest("Search query is required");
        }
        return userRepository.search(query.trim(), PageRequest.of(0, SEARCH_LIMIT)).stream()
                .filter(u -> !u.getId().equals(viewerId))
                .map(UserSummary::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserSummary> followers(String username) {
        User user = getByUsername(username);
        return userRepository.findAllById(followRepository.findFollowerIds(user.getId())).stream()
                .map(UserSummary::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserSummary> following(String username) {
        User user = getByUsername(username);
        return userRepository.findAllById(followRepository.findFollowingIds(user.getId())).stream()
                .map(UserSummary::from)
                .toList();
    }

    @Transactional
    public AccountResponse updateProfile(User user, String displayName, String bio) {
        user.setDisplayName(displayName.trim());
        user.setBio(bio == null || bio.isBlank() ? null : bio.trim());
        return AccountResponse.from(userRepository.save(user));
    }
}
