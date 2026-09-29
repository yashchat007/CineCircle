package com.cinecircle.list;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MovieListRepository extends JpaRepository<MovieList, Long> {

    List<MovieList> findByUserIdOrderByUpdatedAtDesc(Long userId);

    long countByUserId(Long userId);

    Optional<MovieList> findByIdAndUserId(Long id, Long userId);
}
