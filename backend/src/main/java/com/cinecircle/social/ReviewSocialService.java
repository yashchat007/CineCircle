package com.cinecircle.social;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinecircle.common.ApiException;
import com.cinecircle.notification.NotificationService;
import com.cinecircle.review.Review;
import com.cinecircle.review.ReviewRepository;
import com.cinecircle.review.ReviewResponse;
import com.cinecircle.user.User;

@Service
public class ReviewSocialService {

    private final ReviewRepository reviewRepository;
    private final ReviewLikeRepository likeRepository;
    private final ReviewCommentRepository commentRepository;
    private final ReviewEnrichment enrichment;
    private final NotificationService notificationService;

    public ReviewSocialService(ReviewRepository reviewRepository, ReviewLikeRepository likeRepository,
                               ReviewCommentRepository commentRepository, ReviewEnrichment enrichment,
                               NotificationService notificationService) {
        this.reviewRepository = reviewRepository;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
        this.enrichment = enrichment;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public Review getReview(long reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> ApiException.notFound("Review not found"));
    }

    @Transactional
    public ReviewResponse toggleLike(User user, long reviewId) {
        Review review = getReview(reviewId);
        var existing = likeRepository.findByUserIdAndReviewId(user.getId(), reviewId);
        if (existing.isPresent()) {
            likeRepository.delete(existing.get());
        } else {
            likeRepository.save(new ReviewLike(user, review));
            notificationService.reviewLiked(review, user);
        }
        return enrichment.enrich(review, user.getId());
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> comments(long reviewId) {
        getReview(reviewId);
        return commentRepository.findByReviewIdOrderByCreatedAtAsc(reviewId).stream()
                .map(CommentResponse::from)
                .toList();
    }

    @Transactional
    public CommentResponse addComment(User user, long reviewId, String body) {
        Review review = getReview(reviewId);
        String text = body == null || body.isBlank() ? null : body.trim();
        if (text == null) {
            throw ApiException.badRequest("Comment cannot be empty");
        }
        ReviewComment saved = commentRepository.save(new ReviewComment(user, review, text));
        notificationService.reviewCommented(review, user, saved.getId());
        return CommentResponse.from(saved);
    }

    @Transactional
    public CommentResponse updateComment(User user, long reviewId, long commentId, String body) {
        ReviewComment comment = findComment(reviewId, commentId);
        if (!comment.getUser().getId().equals(user.getId())) {
            throw ApiException.forbidden("You can only edit your own comments");
        }
        String text = body == null || body.isBlank() ? null : body.trim();
        if (text == null) {
            throw ApiException.badRequest("Comment cannot be empty");
        }
        comment.update(text);
        return CommentResponse.from(commentRepository.save(comment));
    }

    @Transactional
    public void deleteComment(User user, long reviewId, long commentId) {
        ReviewComment comment = findComment(reviewId, commentId);
        if (!comment.getUser().getId().equals(user.getId())) {
            throw ApiException.forbidden("You can only delete your own comments");
        }
        commentRepository.delete(comment);
    }

    private ReviewComment findComment(long reviewId, long commentId) {
        return commentRepository.findById(commentId)
                .filter(c -> c.getReview().getId().equals(reviewId))
                .orElseThrow(() -> ApiException.notFound("Comment not found"));
    }
}
