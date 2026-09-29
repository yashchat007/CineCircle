package com.cinecircle.tracking;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.cinecircle.auth.CurrentUser;
import com.cinecircle.tracking.TrackingDtos.MovieStatus;
import com.cinecircle.tracking.TrackingDtos.WatchedItem;
import com.cinecircle.tracking.TrackingDtos.WatchlistItem;

/**
 * Watchlist and watched operations. All endpoints act only on the signed-in user's own data.
 */
@RestController
@RequestMapping("/api/me")
public class TrackingController {

    private final TrackingService trackingService;
    private final CurrentUser currentUser;

    public TrackingController(TrackingService trackingService, CurrentUser currentUser) {
        this.trackingService = trackingService;
        this.currentUser = currentUser;
    }

    @GetMapping("/watchlist")
    public List<WatchlistItem> watchlist() {
        return trackingService.watchlist(currentUser.id());
    }

    @PutMapping("/watchlist/{tmdbId}")
    public WatchlistItem addToWatchlist(@PathVariable long tmdbId) {
        return trackingService.addToWatchlist(currentUser.get(), tmdbId);
    }

    @DeleteMapping("/watchlist/{tmdbId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeFromWatchlist(@PathVariable long tmdbId) {
        trackingService.removeFromWatchlist(currentUser.id(), tmdbId);
    }

    @GetMapping("/watched")
    public List<WatchedItem> watched() {
        return trackingService.watched(currentUser.id());
    }

    @PutMapping("/watched/{tmdbId}")
    public WatchedItem markWatched(@PathVariable long tmdbId) {
        return trackingService.markWatched(currentUser.get(), tmdbId);
    }

    @DeleteMapping("/watched/{tmdbId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void unmarkWatched(@PathVariable long tmdbId) {
        trackingService.unmarkWatched(currentUser.id(), tmdbId);
    }

    @GetMapping("/movies/{tmdbId}/status")
    public MovieStatus status(@PathVariable long tmdbId) {
        return trackingService.status(currentUser.id(), tmdbId);
    }
}
