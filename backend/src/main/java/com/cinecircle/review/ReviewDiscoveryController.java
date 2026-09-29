package com.cinecircle.review;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinecircle.auth.CurrentUser;

@RestController
@RequestMapping("/api/reviews")
public class ReviewDiscoveryController {

    private final ReviewService reviewService;
    private final CurrentUser currentUser;

    public ReviewDiscoveryController(ReviewService reviewService, CurrentUser currentUser) {
        this.reviewService = reviewService;
        this.currentUser = currentUser;
    }

    @GetMapping("/recent")
    public List<ReviewResponse> recent() {
        return reviewService.recent(currentUser.id());
    }
}
