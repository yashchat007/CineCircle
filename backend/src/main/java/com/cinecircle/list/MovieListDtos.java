package com.cinecircle.list;

import java.time.Instant;
import java.util.List;

import com.cinecircle.movie.MovieDtos.MovieRef;

public final class MovieListDtos {

    private MovieListDtos() {
    }

    public record MovieListSummary(Long id, String name, String description, long movieCount, Instant updatedAt) {

        public static MovieListSummary from(MovieList list, long movieCount) {
            return new MovieListSummary(list.getId(), list.getName(), list.getDescription(), movieCount,
                    list.getUpdatedAt());
        }
    }

    public record MovieListDetail(Long id, String name, String description, long movieCount, Instant createdAt,
                                  Instant updatedAt, List<MovieListItem> movies) {
    }

    public record MovieListItem(MovieRef movie, Instant addedAt) {

        public static MovieListItem from(MovieListEntry entry) {
            return new MovieListItem(MovieRef.from(entry.getMovie()), entry.getAddedAt());
        }
    }
}
