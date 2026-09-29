package com.cinecircle.social;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface ReviewLikeRepository extends JpaRepository<ReviewLike, Long> {

    boolean existsByUserIdAndReviewId(Long userId, Long reviewId);

    Optional<ReviewLike> findByUserIdAndReviewId(Long userId, Long reviewId);

    long countByReviewId(Long reviewId);

    @Query("select l.review.id from ReviewLike l where l.user.id = :userId and l.review.id in :reviewIds")
    List<Long> findLikedReviewIds(Long userId, Collection<Long> reviewIds);

    @Query("select l.review.id, count(l) from ReviewLike l where l.review.id in :reviewIds group by l.review.id")
    List<Object[]> countByReviewIds(Collection<Long> reviewIds);

    @Modifying
    @Query("delete from ReviewLike l where l.review.id = :reviewId")
    void deleteByReviewId(Long reviewId);
}
