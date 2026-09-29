package com.cinecircle.tracking;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WatchedRepository extends JpaRepository<WatchedEntry, Long> {

    @EntityGraph(attributePaths = "movie")
    List<WatchedEntry> findByUserIdOrderByWatchedAtDesc(Long userId);

    Optional<WatchedEntry> findByUserIdAndMovieTmdbId(Long userId, Long tmdbId);

    long countByUserId(Long userId);

    @EntityGraph(attributePaths = {"user", "movie"})
    List<WatchedEntry> findByUserIdInOrderByWatchedAtDesc(Collection<Long> userIds, Pageable pageable);
}
