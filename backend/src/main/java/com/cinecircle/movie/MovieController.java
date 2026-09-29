package com.cinecircle.movie;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cinecircle.auth.CurrentUser;
import com.cinecircle.movie.MovieDtos.MovieDetails;
import com.cinecircle.movie.MovieDtos.MoviePage;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieService movieService;
    private final RecommendationService recommendationService;
    private final CurrentUser currentUser;

    public MovieController(MovieService movieService, RecommendationService recommendationService,
                           CurrentUser currentUser) {
        this.movieService = movieService;
        this.recommendationService = recommendationService;
        this.currentUser = currentUser;
    }

    @GetMapping("/recommendations")
    public MoviePage recommendations(@RequestParam(defaultValue = "1") int page) {
        return recommendationService.forUser(currentUser.id(), page);
    }

    @GetMapping("/search")
    public MoviePage search(@RequestParam String query, @RequestParam(defaultValue = "1") int page,
                            @RequestParam(required = false) Integer year) {
        return movieService.search(query, page, year);
    }

    @GetMapping("/browse")
    public MoviePage browse(@RequestParam(defaultValue = "popular") String category,
                            @RequestParam(defaultValue = "1") int page) {
        return movieService.browse(category, page);
    }

    @GetMapping("/{tmdbId}")
    public MovieDetails details(@PathVariable long tmdbId) {
        return movieService.details(tmdbId);
    }
}
