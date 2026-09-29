package com.cinecircle.list;

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
import com.cinecircle.list.MovieListDtos.MovieListDetail;
import com.cinecircle.list.MovieListDtos.MovieListItem;
import com.cinecircle.list.MovieListDtos.MovieListSummary;
import com.cinecircle.user.UserService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api")
public class MovieListController {

    public record ListRequest(
            @NotBlank(message = "Name is required")
            @Size(max = 80, message = "Name must be at most 80 characters")
            String name,

            @Size(max = 300, message = "Description must be at most 300 characters")
            String description) {
    }

    private final MovieListService listService;
    private final UserService userService;
    private final CurrentUser currentUser;

    public MovieListController(MovieListService listService, UserService userService, CurrentUser currentUser) {
        this.listService = listService;
        this.userService = userService;
        this.currentUser = currentUser;
    }

    @GetMapping("/me/lists")
    public List<MovieListSummary> myLists() {
        return listService.myLists(currentUser.id());
    }

    @PostMapping("/me/lists")
    @ResponseStatus(HttpStatus.CREATED)
    public MovieListSummary create(@Valid @RequestBody ListRequest request) {
        return listService.create(currentUser.get(), request.name(), request.description());
    }

    @GetMapping("/me/lists/{listId}")
    public MovieListDetail myListDetail(@PathVariable long listId) {
        return listService.detail(currentUser.id(), listId);
    }

    @PutMapping("/me/lists/{listId}")
    public MovieListSummary update(@PathVariable long listId, @Valid @RequestBody ListRequest request) {
        return listService.update(currentUser.get(), listId, request.name(), request.description());
    }

    @DeleteMapping("/me/lists/{listId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable long listId) {
        listService.delete(currentUser.get(), listId);
    }

    @PutMapping("/me/lists/{listId}/movies/{tmdbId}")
    public MovieListItem addMovie(@PathVariable long listId, @PathVariable long tmdbId) {
        return listService.addMovie(currentUser.get(), listId, tmdbId);
    }

    @DeleteMapping("/me/lists/{listId}/movies/{tmdbId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeMovie(@PathVariable long listId, @PathVariable long tmdbId) {
        listService.removeMovie(currentUser.get(), listId, tmdbId);
    }

    @GetMapping("/users/{username}/lists")
    public List<MovieListSummary> userLists(@PathVariable String username) {
        return listService.userLists(userService.getByUsername(username).getId());
    }

    @GetMapping("/users/{username}/lists/{listId}")
    public MovieListDetail userListDetail(@PathVariable String username, @PathVariable long listId) {
        return listService.detail(userService.getByUsername(username).getId(), listId);
    }
}
