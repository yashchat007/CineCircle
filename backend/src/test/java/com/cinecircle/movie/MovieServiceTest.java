package com.cinecircle.movie;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.cinecircle.movie.MovieDtos.MoviePage;
import com.cinecircle.movie.MovieDtos.MovieSummary;
import com.cinecircle.review.ReviewRepository;

@ExtendWith(MockitoExtension.class)
class MovieServiceTest {

    @Mock
    private TmdbClient tmdbClient;
    @Mock
    private MovieRepository movieRepository;
    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private MovieService movieService;

    @Test
    void browseUpcoming_excludesPastTodayAndMissingReleaseDates() {
        LocalDate today = LocalDate.now();
        MoviePage fromTmdb = new MoviePage(1, 1, 4, List.of(
                summary(1L, "Future", today.plusDays(10)),
                summary(2L, "Past", today.minusDays(30)),
                summary(3L, "Today", today),
                summary(4L, "No date", null)));
        when(tmdbClient.browse("upcoming", 1)).thenReturn(fromTmdb);

        MoviePage page = movieService.browse("upcoming", 1);

        assertThat(page.results()).extracting(MovieSummary::tmdbId).containsExactly(1L);
        verify(tmdbClient).browse("upcoming", 1);
        verifyNoMoreInteractions(tmdbClient);
    }

    @Test
    void browsePopular_passesThroughTmdbResultsUnchanged() {
        MovieSummary movie = summary(99L, "Hit", LocalDate.now().minusYears(1));
        MoviePage fromTmdb = new MoviePage(1, 5, 100, List.of(movie));
        when(tmdbClient.browse("popular", 2)).thenReturn(fromTmdb);

        MoviePage page = movieService.browse("popular", 2);

        assertThat(page).isEqualTo(fromTmdb);
        verify(tmdbClient).browse("popular", 2);
    }

    private static MovieSummary summary(long id, String title, LocalDate releaseDate) {
        return new MovieSummary(id, title, "overview", "/p.jpg", releaseDate, 7.0);
    }
}
