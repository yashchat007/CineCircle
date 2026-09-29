package com.cinecircle.follow;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface FollowRepository extends JpaRepository<Follow, Long> {

    boolean existsByFollowerIdAndFollowingId(Long followerId, Long followingId);

    Optional<Follow> findByFollowerIdAndFollowingId(Long followerId, Long followingId);

    @Query("select f.following.id from Follow f where f.follower.id = :followerId")
    List<Long> findFollowingIds(Long followerId);

    @Query("select f.follower.id from Follow f where f.following.id = :followingId")
    List<Long> findFollowerIds(Long followingId);

    long countByFollowerId(Long followerId);

    long countByFollowingId(Long followingId);
}
