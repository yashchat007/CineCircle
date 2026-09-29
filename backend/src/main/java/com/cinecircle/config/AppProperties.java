package com.cinecircle.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "cinecircle")
public record AppProperties(Jwt jwt, Cors cors, Tmdb tmdb) {

    public record Jwt(String secret, long expirationHours) {
    }

    public record Cors(List<String> allowedOrigins) {
    }

    public record Tmdb(String baseUrl, String apiToken) {
    }
}
