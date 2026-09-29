package com.cinecircle.social;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.cinecircle.review.Review;
import com.cinecircle.review.ReviewResponse;

@Component
public class ReviewEnrichment {

    private final ReviewLikeRepository likeRepository;
    private final ReviewCommentRepository commentRepository;

    public ReviewEnrichment(ReviewLikeRepository likeRepository, ReviewCommentRepository commentRepository) {
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
    }

    public ReviewResponse enrich(Review review, Long viewerId) {
        return enrichList(List.of(review), viewerId).getFirst();
    }

    public List<ReviewResponse> enrichList(List<Review> reviews, Long viewerId) {
        if (reviews.isEmpty()) {
            return List.of();
        }
        List<Long> ids = reviews.stream().map(Review::getId).toList();
        Map<Long, Long> likeCounts = ids.isEmpty() ? Map.of() : toCountMap(likeRepository.countByReviewIds(ids));
        Map<Long, Long> commentCounts = ids.isEmpty() ? Map.of() : toCountMap(commentRepository.countByReviewIds(ids));
        Set<Long> liked = viewerId == null ? Set.of()
                : Set.copyOf(likeRepository.findLikedReviewIds(viewerId, ids));
        return reviews.stream()
                .map(r -> ReviewResponse.from(r,
                        likeCounts.getOrDefault(r.getId(), 0L),
                        commentCounts.getOrDefault(r.getId(), 0L),
                        liked.contains(r.getId())))
                .toList();
    }

    private static Map<Long, Long> toCountMap(List<Object[]> rows) {
        Map<Long, Long> map = new HashMap<>();
        for (Object[] row : rows) {
            map.put((Long) row[0], (Long) row[1]);
        }
        return map;
    }
}
