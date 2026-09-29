package com.cinecircle.feed;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Stream;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinecircle.follow.FollowRepository;
import com.cinecircle.list.MovieListEntryRepository;
import com.cinecircle.review.Review;
import com.cinecircle.review.ReviewRepository;
import com.cinecircle.social.ReviewLikeRepository;
import com.cinecircle.social.ReviewCommentRepository;
import com.cinecircle.tracking.WatchedRepository;

/**
 * Builds the home feed from watched, review, and list activity of users the viewer follows.
 */
@Service
public class FeedService {

    static final int FEED_SIZE = 50;

    private final FollowRepository followRepository;
    private final WatchedRepository watchedRepository;
    private final ReviewRepository reviewRepository;
    private final MovieListEntryRepository listEntryRepository;
    private final ReviewLikeRepository likeRepository;
    private final ReviewCommentRepository commentRepository;

    public FeedService(FollowRepository followRepository, WatchedRepository watchedRepository,
                       ReviewRepository reviewRepository, MovieListEntryRepository listEntryRepository,
                       ReviewLikeRepository likeRepository, ReviewCommentRepository commentRepository) {
        this.followRepository = followRepository;
        this.watchedRepository = watchedRepository;
        this.reviewRepository = reviewRepository;
        this.listEntryRepository = listEntryRepository;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
    }

    @Transactional(readOnly = true)
    public List<FeedItem> feed(Long userId) {
        List<Long> followingIds = followRepository.findFollowingIds(userId);
        if (followingIds.isEmpty()) {
            return List.of();
        }
        PageRequest limit = PageRequest.of(0, FEED_SIZE);
        Stream<FeedItem> watched = watchedRepository.findByUserIdInOrderByWatchedAtDesc(followingIds, limit)
                .stream().map(FeedItem::from);
        List<Review> reviews = reviewRepository.findByUserIdInOrderByCreatedAtDesc(followingIds, limit);
        List<Long> reviewIds = reviews.stream().map(Review::getId).toList();
        Map<Long, Long> likeCounts = reviewIds.isEmpty() ? Map.of() : toCountMap(likeRepository.countByReviewIds(reviewIds));
        Map<Long, Long> commentCounts = reviewIds.isEmpty() ? Map.of() : toCountMap(commentRepository.countByReviewIds(reviewIds));
        Stream<FeedItem> reviewItems = reviews.stream()
                .map(r -> FeedItem.from(r, likeCounts.getOrDefault(r.getId(), 0L),
                        commentCounts.getOrDefault(r.getId(), 0L)));
        Stream<FeedItem> listItems = listEntryRepository.findByListUserIdInOrderByAddedAtDesc(followingIds, limit)
                .stream().map(FeedItem::from);
        return Stream.of(watched, reviewItems, listItems)
                .flatMap(s -> s)
                .sorted(Comparator.comparing(FeedItem::occurredAt).reversed())
                .limit(FEED_SIZE)
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
