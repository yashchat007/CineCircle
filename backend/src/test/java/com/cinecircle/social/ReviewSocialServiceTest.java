package com.cinecircle.social;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.cinecircle.common.ApiException;
import com.cinecircle.movie.Movie;
import com.cinecircle.notification.NotificationService;
import com.cinecircle.review.Review;
import com.cinecircle.review.ReviewRepository;
import com.cinecircle.review.ReviewResponse;
import com.cinecircle.user.User;

@ExtendWith(MockitoExtension.class)
class ReviewSocialServiceTest {

    @Mock
    private ReviewRepository reviewRepository;
    @Mock
    private ReviewLikeRepository likeRepository;
    @Mock
    private ReviewCommentRepository commentRepository;
    @Mock
    private ReviewEnrichment enrichment;
    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private ReviewSocialService service;

    @Test
    void addCommentRejectsBlankBody() {
        User user = new User("u", "u@x.com", "hash", "U");
        Review review = new Review(user, new Movie(1L, "M", null, null), 5, "body");
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));

        assertThrows(ApiException.class, () -> service.addComment(user, 1L, "   "));
    }

    @Test
    void toggleLikeNotifiesAuthor() {
        User author = new User("author", "a@x.com", "hash", "Author");
        User liker = new User("liker", "l@x.com", "hash", "Liker");
        Review review = new Review(author, new Movie(1L, "M", null, null), 5, "body");
        when(reviewRepository.findById(1L)).thenReturn(Optional.of(review));
        when(likeRepository.findByUserIdAndReviewId(any(), eq(1L))).thenReturn(Optional.empty());
        when(likeRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(enrichment.enrich(review, liker.getId()))
                .thenReturn(new ReviewResponse(1L, null, null, 5, "body", null, null, 1, 0, true));

        ReviewResponse result = service.toggleLike(liker, 1L);

        verify(notificationService).reviewLiked(review, liker);
        assertEquals(1, result.likeCount());
    }
}
