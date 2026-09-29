package com.cinecircle.social;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cinecircle.auth.CurrentUser;
import com.cinecircle.review.ReviewResponse;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/reviews/{reviewId}")
public class ReviewSocialController {

    public record CommentRequest(
            @NotBlank(message = "Comment is required")
            @Size(max = 2000, message = "Comment must be at most 2000 characters")
            String body) {
    }

    private final ReviewSocialService socialService;
    private final CurrentUser currentUser;

    public ReviewSocialController(ReviewSocialService socialService, CurrentUser currentUser) {
        this.socialService = socialService;
        this.currentUser = currentUser;
    }

    @PutMapping("/like")
    public ReviewResponse toggleLike(@PathVariable long reviewId) {
        return socialService.toggleLike(currentUser.get(), reviewId);
    }

    @GetMapping("/comments")
    public List<CommentResponse> comments(@PathVariable long reviewId) {
        return socialService.comments(reviewId);
    }

    @PostMapping("/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponse addComment(@PathVariable long reviewId, @Valid @RequestBody CommentRequest request) {
        return socialService.addComment(currentUser.get(), reviewId, request.body());
    }

    @PutMapping("/comments/{commentId}")
    public CommentResponse updateComment(@PathVariable long reviewId, @PathVariable long commentId,
                                         @Valid @RequestBody CommentRequest request) {
        return socialService.updateComment(currentUser.get(), reviewId, commentId, request.body());
    }

    @DeleteMapping("/comments/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(@PathVariable long reviewId, @PathVariable long commentId) {
        socialService.deleteComment(currentUser.get(), reviewId, commentId);
    }
}
