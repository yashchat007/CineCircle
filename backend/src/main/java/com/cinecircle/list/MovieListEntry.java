package com.cinecircle.list;

import java.time.Instant;

import com.cinecircle.movie.Movie;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "movie_list_entries", uniqueConstraints = @UniqueConstraint(columnNames = {"list_id", "movie_id"}))
public class MovieListEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "list_id")
    private MovieList list;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "movie_id")
    private Movie movie;

    @Column(name = "added_at", nullable = false, updatable = false)
    private Instant addedAt;

    protected MovieListEntry() {
    }

    public MovieListEntry(MovieList list, Movie movie) {
        this.list = list;
        this.movie = movie;
    }

    @PrePersist
    void onCreate() {
        addedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public MovieList getList() {
        return list;
    }

    public Movie getMovie() {
        return movie;
    }

    public Instant getAddedAt() {
        return addedAt;
    }
}
