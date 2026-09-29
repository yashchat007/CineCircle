package com.cinecircle;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.cinecircle.movie.Movie;
import com.cinecircle.movie.MovieDtos.Genre;
import com.cinecircle.movie.MovieDtos.MovieDetails;
import com.cinecircle.movie.MovieDtos.MoviePage;
import com.cinecircle.movie.MovieDtos.MovieSummary;
import com.cinecircle.movie.TmdbClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Exercises the full CineCircle product flow through the REST API (V1 core + V2 community + V3 polish).
 */
@SpringBootTest
@AutoConfigureMockMvc
class CoreJourneyIntegrationTest {

    private static final long INCEPTION = 27205L;

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper json;

    @MockitoBean
    private TmdbClient tmdbClient;

    @BeforeEach
    void stubMovieService() {
        MovieSummary summary = new MovieSummary(INCEPTION, "Inception", "A thief who steals secrets...",
                "/inception.jpg", LocalDate.of(2010, 7, 15), 8.4);
        when(tmdbClient.search(eq("inception"), anyInt(), isNull())).thenReturn(new MoviePage(1, 1, 1, List.of(summary)));
        when(tmdbClient.search(eq("inception"), anyInt(), eq(2010))).thenReturn(new MoviePage(1, 1, 1, List.of(summary)));
        when(tmdbClient.browse(eq("popular"), anyInt())).thenReturn(new MoviePage(1, 1, 1, List.of(summary)));
        when(tmdbClient.discoverByGenres(any(), anyInt())).thenReturn(new MoviePage(1, 1, 1, List.of(summary)));
        when(tmdbClient.movieGenres(INCEPTION)).thenReturn(List.of(new Genre(28L, "Action")));
        when(tmdbClient.details(eq(INCEPTION), any(), anyLong())).thenAnswer(inv -> new MovieDetails(
                INCEPTION, "Inception", "Your mind is the scene of the crime.", "A thief who steals secrets...",
                "/inception.jpg", "/backdrop.jpg", LocalDate.of(2010, 7, 15), 148,
                List.of(new Genre(28L, "Action")), "en", "Released", 8.4, 30000,
                inv.getArgument(1), inv.getArgument(2)));
        when(tmdbClient.fetchReference(INCEPTION))
                .thenReturn(new Movie(INCEPTION, "Inception", "/inception.jpg", LocalDate.of(2010, 7, 15)));
    }

    @Test
    void protectedEndpointsRequireAuthentication() throws Exception {
        mvc.perform(get("/api/feed")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/movies/search").param("query", "inception")).andExpect(status().isUnauthorized());
    }

    @Test
    void registrationValidatesInputAndRejectsDuplicates() throws Exception {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"a\",\"email\":\"bad\",\"password\":\"short\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.username").exists())
                .andExpect(jsonPath("$.fieldErrors.email").exists())
                .andExpect(jsonPath("$.fieldErrors.password").exists());

        register("dupe_user", "dupe@example.com");
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody("DUPE_USER", "other@example.com")))
                .andExpect(status().isConflict());
    }

    @Test
    void loginRejectsWrongPassword() throws Exception {
        register("carol", "carol@example.com");
        mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"login\":\"carol\",\"password\":\"wrong-password\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void fullProductJourney() throws Exception {
        register("alice", "alice@example.com");
        register("bob", "bob@example.com");
        String alice = login("alice");
        String bob = login("bob@example.com");

        // Search with year filter
        mvc.perform(get("/api/movies/search").param("query", "inception").param("year", "2010")
                        .header("Authorization", alice))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results[0].tmdbId").value(INCEPTION));

        mvc.perform(get("/api/movies/" + INCEPTION).header("Authorization", alice))
                .andExpect(jsonPath("$.genres[0].name").value("Action"));

        mvc.perform(put("/api/me/watchlist/" + INCEPTION).header("Authorization", alice)).andExpect(status().isOk());
        mvc.perform(put("/api/me/watched/" + INCEPTION).header("Authorization", alice)).andExpect(status().isOk());

        mvc.perform(put("/api/movies/" + INCEPTION + "/review").header("Authorization", alice)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"rating\":5,\"body\":\"A dream within a dream.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.likeCount").value(0));

        String reviewBody = mvc.perform(get("/api/movies/" + INCEPTION + "/reviews").header("Authorization", bob))
                .andExpect(jsonPath("$", hasSize(1)))
                .andReturn().getResponse().getContentAsString();
        long reviewId = json.readTree(reviewBody).get(0).get("id").asLong();

        // Likes and comments (V2)
        mvc.perform(put("/api/reviews/" + reviewId + "/like").header("Authorization", bob))
                .andExpect(jsonPath("$.likeCount").value(1))
                .andExpect(jsonPath("$.likedByViewer").value(true));
        mvc.perform(post("/api/reviews/" + reviewId + "/comments").header("Authorization", bob)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"body\":\"Mind-bending!\"}"))
                .andExpect(status().isCreated());
        mvc.perform(get("/api/reviews/" + reviewId + "/comments").header("Authorization", alice))
                .andExpect(jsonPath("$", hasSize(1)));

        // Personal movie list (V2)
        String listBody = mvc.perform(post("/api/me/lists").header("Authorization", alice)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Nolan picks\",\"description\":\"Favorites\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        long listId = json.readTree(listBody).get("id").asLong();
        mvc.perform(put("/api/me/lists/" + listId + "/movies/" + INCEPTION).header("Authorization", alice))
                .andExpect(status().isOk());

        // User search and richer profile (V2)
        mvc.perform(get("/api/users/search").param("query", "ali").header("Authorization", bob))
                .andExpect(jsonPath("$[0].username").value("alice"));
        mvc.perform(put("/api/users/alice/follow").header("Authorization", bob)).andExpect(status().isNoContent());
        mvc.perform(get("/api/users/alice").header("Authorization", bob))
                .andExpect(jsonPath("$.followerCount").value(1))
                .andExpect(jsonPath("$.following").value(true));
        mvc.perform(get("/api/users/alice/followers").header("Authorization", bob))
                .andExpect(jsonPath("$[0].username").value("bob"));
        mvc.perform(get("/api/users/bob/following").header("Authorization", bob))
                .andExpect(jsonPath("$[0].username").value("alice"));

        // Notifications (V3)
        mvc.perform(get("/api/notifications").header("Authorization", alice))
                .andExpect(jsonPath("$", hasSize(org.hamcrest.Matchers.greaterThan(0))));
        mvc.perform(get("/api/notifications/unread-count").header("Authorization", alice))
                .andExpect(jsonPath("$.count").value(org.hamcrest.Matchers.greaterThan(0)));
        mvc.perform(put("/api/notifications/read-all").header("Authorization", alice))
                .andExpect(status().isNoContent());

        // Improved feed with social metadata (V2/V3)
        mvc.perform(get("/api/feed").header("Authorization", bob))
                .andExpect(jsonPath("$", hasSize(org.hamcrest.Matchers.greaterThan(0))))
                .andExpect(jsonPath("$[0].likeCount").exists());

        // Community review discovery and recommendations (V3)
        mvc.perform(get("/api/reviews/recent").header("Authorization", bob))
                .andExpect(jsonPath("$", hasSize(1)));
        mvc.perform(get("/api/movies/recommendations").header("Authorization", alice))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.results").isArray());

        mvc.perform(get("/api/users/alice/lists").header("Authorization", bob))
                .andExpect(jsonPath("$[0].name").value("Nolan picks"));

        // Ownership rules
        String commentBody = mvc.perform(get("/api/reviews/" + reviewId + "/comments").header("Authorization", alice))
                .andReturn().getResponse().getContentAsString();
        long commentId = json.readTree(commentBody).get(0).get("id").asLong();
        mvc.perform(put("/api/reviews/" + reviewId + "/comments/" + commentId).header("Authorization", alice)
                        .contentType(MediaType.APPLICATION_JSON).content("{\"body\":\"edited\"}"))
                .andExpect(status().isForbidden());
        mvc.perform(delete("/api/reviews/" + (reviewId + 999) + "/comments/" + commentId).header("Authorization", bob))
                .andExpect(status().isNotFound());
        mvc.perform(delete("/api/me/lists/" + listId).header("Authorization", bob))
                .andExpect(status().isNotFound());

        // Deleting content that other rows reference
        mvc.perform(delete("/api/me/lists/" + listId).header("Authorization", alice))
                .andExpect(status().isNoContent());
        mvc.perform(delete("/api/movies/" + INCEPTION + "/review").header("Authorization", alice))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/movies/" + INCEPTION + "/reviews").header("Authorization", bob))
                .andExpect(jsonPath("$", hasSize(0)));
    }

    private void register(String username, String email) throws Exception {
        mvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON)
                        .content(registerBody(username, email)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").exists());
    }

    private static String registerBody(String username, String email) {
        return "{\"username\":\"" + username + "\",\"email\":\"" + email + "\",\"password\":\"password123\"}";
    }

    private String login(String login) throws Exception {
        String body = mvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"login\":\"" + login + "\",\"password\":\"password123\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        JsonNode node = json.readTree(body);
        return "Bearer " + node.get("token").asText();
    }
}
