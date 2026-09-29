package com.cinecircle.list;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinecircle.common.ApiException;
import com.cinecircle.list.MovieListDtos.MovieListDetail;
import com.cinecircle.list.MovieListDtos.MovieListItem;
import com.cinecircle.list.MovieListDtos.MovieListSummary;
import com.cinecircle.movie.Movie;
import com.cinecircle.movie.MovieService;
import com.cinecircle.user.User;

@Service
public class MovieListService {

    private final MovieListRepository listRepository;
    private final MovieListEntryRepository entryRepository;
    private final MovieService movieService;

    public MovieListService(MovieListRepository listRepository, MovieListEntryRepository entryRepository,
                            MovieService movieService) {
        this.listRepository = listRepository;
        this.entryRepository = entryRepository;
        this.movieService = movieService;
    }

    @Transactional(readOnly = true)
    public List<MovieListSummary> myLists(Long userId) {
        return listRepository.findByUserIdOrderByUpdatedAtDesc(userId).stream()
                .map(l -> MovieListSummary.from(l, entryRepository.countByListId(l.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MovieListSummary> userLists(Long userId) {
        return myLists(userId);
    }

    @Transactional(readOnly = true)
    public MovieListDetail detail(Long userId, long listId) {
        MovieList list = ownedList(userId, listId);
        List<MovieListItem> movies = entryRepository.findByListIdOrderByAddedAtDesc(listId).stream()
                .map(MovieListItem::from)
                .toList();
        return new MovieListDetail(list.getId(), list.getName(), list.getDescription(), movies.size(),
                list.getCreatedAt(), list.getUpdatedAt(), movies);
    }

    @Transactional
    public MovieListSummary create(User user, String name, String description) {
        MovieList list = listRepository.save(new MovieList(user, name.trim(),
                description == null || description.isBlank() ? null : description.trim()));
        return MovieListSummary.from(list, 0);
    }

    @Transactional
    public MovieListSummary update(User user, long listId, String name, String description) {
        MovieList list = ownedList(user.getId(), listId);
        list.update(name.trim(), description);
        listRepository.save(list);
        return MovieListSummary.from(list, entryRepository.countByListId(listId));
    }

    @Transactional
    public void delete(User user, long listId) {
        MovieList list = ownedList(user.getId(), listId);
        entryRepository.deleteByListId(listId);
        listRepository.delete(list);
    }

    @Transactional
    public MovieListItem addMovie(User user, long listId, long tmdbId) {
        MovieList list = ownedList(user.getId(), listId);
        return entryRepository.findByListIdAndMovieTmdbId(listId, tmdbId)
                .map(MovieListItem::from)
                .orElseGet(() -> {
                    Movie movie = movieService.getOrCreateReference(tmdbId);
                    MovieListEntry entry = entryRepository.save(new MovieListEntry(list, movie));
                    list.touch();
                    listRepository.save(list);
                    return MovieListItem.from(entry);
                });
    }

    @Transactional
    public void removeMovie(User user, long listId, long tmdbId) {
        MovieList list = ownedList(user.getId(), listId);
        entryRepository.findByListIdAndMovieTmdbId(listId, tmdbId).ifPresent(entry -> {
            entryRepository.delete(entry);
            list.touch();
            listRepository.save(list);
        });
    }

    private MovieList ownedList(Long userId, long listId) {
        return listRepository.findByIdAndUserId(listId, userId)
                .orElseThrow(() -> ApiException.notFound("List not found"));
    }
}
