package com.cinecircle.list;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface MovieListEntryRepository extends JpaRepository<MovieListEntry, Long> {

    @EntityGraph(attributePaths = "movie")
    List<MovieListEntry> findByListIdOrderByAddedAtDesc(Long listId);

    @EntityGraph(attributePaths = {"list", "movie", "list.user"})
    List<MovieListEntry> findByListUserIdInOrderByAddedAtDesc(Collection<Long> userIds, Pageable pageable);

    Optional<MovieListEntry> findByListIdAndMovieTmdbId(Long listId, Long tmdbId);

    long countByListId(Long listId);

    @Modifying
    @Query("delete from MovieListEntry e where e.list.id = :listId")
    void deleteByListId(Long listId);
}
