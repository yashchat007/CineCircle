package com.cinecircle.review;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    @EntityGraph(attributePaths = {"user", "movie"})
    Optional<Review> findByUserIdAndMovieTmdbId(Long userId, Long tmdbId);

    @EntityGraph(attributePaths = {"user", "movie"})
    List<Review> findByMovieTmdbIdOrderByCreatedAtDesc(Long tmdbId);

    @EntityGraph(attributePaths = {"user", "movie"})
    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"user", "movie"})
    List<Review> findByUserIdInOrderByCreatedAtDesc(Collection<Long> userIds, Pageable pageable);

    long countByUserId(Long userId);

    long countByMovieTmdbId(Long tmdbId);

    @Query("select avg(r.rating) from Review r where r.movie.tmdbId = :tmdbId")
    Double averageRatingForMovie(Long tmdbId);

    @EntityGraph(attributePaths = {"user", "movie"})
    List<Review> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
