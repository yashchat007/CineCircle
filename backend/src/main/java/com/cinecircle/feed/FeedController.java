package com.cinecircle.feed;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cinecircle.auth.CurrentUser;

@RestController
@RequestMapping("/api/feed")
public class FeedController {

    private final FeedService feedService;
    private final CurrentUser currentUser;

    public FeedController(FeedService feedService, CurrentUser currentUser) {
        this.feedService = feedService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public List<FeedItem> feed() {
        return feedService.feed(currentUser.id());
    }
}
