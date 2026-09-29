package com.cinecircle.movie;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Lightweight local reference to a movie from the external movie service (TMDB).
 * Only the fields needed to display user activity are stored; full details are always
 * read from the external service.
 */
@Entity
@Table(name = "movies")
public class Movie {

    @Id
    @Column(name = "tmdb_id")
    private Long tmdbId;

    @Column(nullable = false)
    private String title;

    @Column(name = "poster_path")
    private String posterPath;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    protected Movie() {
    }

    public Movie(Long tmdbId, String title, String posterPath, LocalDate releaseDate) {
        this.tmdbId = tmdbId;
        this.title = title;
        this.posterPath = posterPath;
        this.releaseDate = releaseDate;
    }

    public Long getTmdbId() {
        return tmdbId;
    }

    public String getTitle() {
        return title;
    }

    public String getPosterPath() {
        return posterPath;
    }

    public LocalDate getReleaseDate() {
        return releaseDate;
    }
}
