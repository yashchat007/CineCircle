package com.cinecircle.tracking;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WatchlistRepository extends JpaRepository<WatchlistEntry, Long> {

    @EntityGraph(attributePaths = "movie")
    List<WatchlistEntry> findByUserIdOrderByAddedAtDesc(Long userId);

    Optional<WatchlistEntry> findByUserIdAndMovieTmdbId(Long userId, Long tmdbId);

    boolean existsByUserIdAndMovieTmdbId(Long userId, Long tmdbId);
}
