package com.cinecircle.auth;

import com.cinecircle.user.AccountResponse;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record RegisterRequest(
            @NotBlank(message = "Username is required")
            @Size(min = 3, max = 30, message = "Username must be 3-30 characters")
            @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Use only letters, numbers, and underscores")
            String username,

            @NotBlank(message = "Email is required")
            @Email(message = "Enter a valid email")
            @Size(max = 255)
            String email,

            @NotBlank(message = "Password is required")
            @Size(min = 8, max = 100, message = "Password must be 8-100 characters")
            String password,

            @Size(max = 50, message = "Display name must be at most 50 characters")
            String displayName) {
    }

    public record LoginRequest(
            @NotBlank(message = "Username or email is required") String login,
            @NotBlank(message = "Password is required") String password) {
    }

    public record AuthResponse(String token, AccountResponse user) {
    }
}
