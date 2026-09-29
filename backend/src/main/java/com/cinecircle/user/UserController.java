package com.cinecircle.user;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cinecircle.auth.CurrentUser;
import com.cinecircle.follow.FollowService;
import com.cinecircle.review.ReviewResponse;
import com.cinecircle.review.ReviewService;
import com.cinecircle.tracking.TrackingDtos.WatchedItem;
import com.cinecircle.tracking.TrackingService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/users")
public class UserController {

    public record UpdateProfileRequest(
            @NotBlank(message = "Display name is required")
            @Size(max = 50, message = "Display name must be at most 50 characters")
            String displayName,

            @Size(max = 300, message = "Bio must be at most 300 characters")
            String bio) {
    }

    private final UserService userService;
    private final TrackingService trackingService;
    private final ReviewService reviewService;
    private final FollowService followService;
    private final CurrentUser currentUser;

    public UserController(UserService userService, TrackingService trackingService, ReviewService reviewService,
                          FollowService followService, CurrentUser currentUser) {
        this.userService = userService;
        this.trackingService = trackingService;
        this.reviewService = reviewService;
        this.followService = followService;
        this.currentUser = currentUser;
    }

    @GetMapping("/search")
    public List<UserSummary> search(@RequestParam String query) {
        return userService.search(query, currentUser.id());
    }

    @GetMapping("/me")
    public AccountResponse me() {
        return AccountResponse.from(currentUser.get());
    }

    @PutMapping("/me")
    public AccountResponse updateMe(@Valid @RequestBody UpdateProfileRequest request) {
        return userService.updateProfile(currentUser.get(), request.displayName(), request.bio());
    }

    @GetMapping("/{username}")
    public ProfileResponse profile(@PathVariable String username) {
        return userService.profile(username, currentUser.id());
    }

    @GetMapping("/{username}/followers")
    public List<UserSummary> followers(@PathVariable String username) {
        return userService.followers(username);
    }

    @GetMapping("/{username}/following")
    public List<UserSummary> following(@PathVariable String username) {
        return userService.following(username);
    }

    @GetMapping("/{username}/watched")
    public List<WatchedItem> watched(@PathVariable String username) {
        return trackingService.watched(userService.getByUsername(username).getId());
    }

    @GetMapping("/{username}/reviews")
    public List<ReviewResponse> reviews(@PathVariable String username) {
        Long userId = userService.getByUsername(username).getId();
        return reviewService.byUser(userId, currentUser.id());
    }

    @PutMapping("/{username}/follow")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void follow(@PathVariable String username) {
        followService.follow(currentUser.get(), userService.getByUsername(username));
    }

    @DeleteMapping("/{username}/follow")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unfollow(@PathVariable String username) {
        followService.unfollow(currentUser.id(), userService.getByUsername(username).getId());
    }
}
