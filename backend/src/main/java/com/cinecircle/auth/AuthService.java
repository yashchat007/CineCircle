package com.cinecircle.auth;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cinecircle.auth.AuthDtos.AuthResponse;
import com.cinecircle.auth.AuthDtos.LoginRequest;
import com.cinecircle.auth.AuthDtos.RegisterRequest;
import com.cinecircle.common.ApiException;
import com.cinecircle.user.AccountResponse;
import com.cinecircle.user.User;
import com.cinecircle.user.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, TokenService tokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenService = tokenService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String username = request.username().trim();
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByUsernameIgnoreCase(username)) {
            throw ApiException.conflict("That username is already taken");
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw ApiException.conflict("An account with that email already exists");
        }
        String displayName = request.displayName() == null || request.displayName().isBlank()
                ? username
                : request.displayName().trim();
        User user = userRepository.save(
                new User(username, email, passwordEncoder.encode(request.password()), displayName));
        return new AuthResponse(tokenService.issue(user), AccountResponse.from(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String login = request.login().trim();
        User user = (login.contains("@")
                ? userRepository.findByEmailIgnoreCase(login)
                : userRepository.findByUsernameIgnoreCase(login))
                .filter(u -> passwordEncoder.matches(request.password(), u.getPasswordHash()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid username/email or password"));
        return new AuthResponse(tokenService.issue(user), AccountResponse.from(user));
    }
}
