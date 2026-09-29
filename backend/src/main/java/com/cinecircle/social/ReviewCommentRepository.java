package com.cinecircle.social;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface ReviewCommentRepository extends JpaRepository<ReviewComment, Long> {

    @EntityGraph(attributePaths = "user")
    List<ReviewComment> findByReviewIdOrderByCreatedAtAsc(Long reviewId);

    long countByReviewId(Long reviewId);

    @Query("select c.review.id, count(c) from ReviewComment c where c.review.id in :reviewIds group by c.review.id")
    List<Object[]> countByReviewIds(Collection<Long> reviewIds);

    @Modifying
    @Query("delete from ReviewComment c where c.review.id = :reviewId")
    void deleteByReviewId(Long reviewId);
}
