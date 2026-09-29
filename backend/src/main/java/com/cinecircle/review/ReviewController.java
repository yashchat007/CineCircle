package com.cinecircle.review;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cinecircle.auth.CurrentUser;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/movies/{tmdbId}")
public class ReviewController {

    public record ReviewRequest(
            @NotNull(message = "Rating is required")
            @Min(value = 1, message = "Rating must be between 1 and 5")
            @Max(value = 5, message = "Rating must be between 1 and 5")
            Integer rating,

            @Size(max = 5000, message = "Review must be at most 5000 characters")
            String body) {
    }

    private final ReviewService reviewService;
    private final CurrentUser currentUser;

    public ReviewController(ReviewService reviewService, CurrentUser currentUser) {
        this.reviewService = reviewService;
        this.currentUser = currentUser;
    }

    @GetMapping("/reviews")
    public List<ReviewResponse> reviews(@PathVariable long tmdbId) {
        return reviewService.forMovie(tmdbId, currentUser.id());
    }

    @PutMapping("/review")
    public ReviewResponse saveMyReview(@PathVariable long tmdbId, @Valid @RequestBody ReviewRequest request) {
        return reviewService.save(currentUser.get(), tmdbId, request.rating(), request.body());
    }

    @DeleteMapping("/review")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMyReview(@PathVariable long tmdbId) {
        reviewService.delete(currentUser.id(), tmdbId);
    }
}
