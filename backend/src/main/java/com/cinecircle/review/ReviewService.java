package com.cinecircle.review;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinecircle.movie.Movie;
import com.cinecircle.movie.MovieService;
import com.cinecircle.notification.NotificationService;
import com.cinecircle.social.ReviewCommentRepository;
import com.cinecircle.social.ReviewEnrichment;
import com.cinecircle.social.ReviewLikeRepository;
import com.cinecircle.user.User;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final MovieService movieService;
    private final ReviewEnrichment enrichment;
    private final NotificationService notificationService;
    private final ReviewLikeRepository likeRepository;
    private final ReviewCommentRepository commentRepository;

    public ReviewService(ReviewRepository reviewRepository, MovieService movieService, ReviewEnrichment enrichment,
                         NotificationService notificationService, ReviewLikeRepository likeRepository,
                         ReviewCommentRepository commentRepository) {
        this.reviewRepository = reviewRepository;
        this.movieService = movieService;
        this.enrichment = enrichment;
        this.notificationService = notificationService;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> forMovie(long tmdbId, Long viewerId) {
        return enrichment.enrichList(reviewRepository.findByMovieTmdbIdOrderByCreatedAtDesc(tmdbId), viewerId);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> byUser(Long userId, Long viewerId) {
        return enrichment.enrichList(reviewRepository.findByUserIdOrderByCreatedAtDesc(userId), viewerId);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> recent(Long viewerId) {
        return enrichment.enrichList(
                reviewRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 20)), viewerId);
    }

    @Transactional
    public ReviewResponse save(User user, long tmdbId, int rating, String body) {
        String text = body == null || body.isBlank() ? null : body.trim();
        boolean created = reviewRepository.findByUserIdAndMovieTmdbId(user.getId(), tmdbId).isEmpty();
        Review review = reviewRepository.findByUserIdAndMovieTmdbId(user.getId(), tmdbId)
                .map(existing -> {
                    existing.update(rating, text);
                    return existing;
                })
                .orElseGet(() -> {
                    Movie movie = movieService.getOrCreateReference(tmdbId);
                    return new Review(user, movie, rating, text);
                });
        Review saved = reviewRepository.saveAndFlush(review);
        if (created) {
            notificationService.followedUserReviewed(saved);
        }
        return enrichment.enrich(saved, user.getId());
    }

    @Transactional
    public void delete(Long userId, long tmdbId) {
        reviewRepository.findByUserIdAndMovieTmdbId(userId, tmdbId).ifPresent(review -> {
            likeRepository.deleteByReviewId(review.getId());
            commentRepository.deleteByReviewId(review.getId());
            reviewRepository.delete(review);
        });
    }
}
