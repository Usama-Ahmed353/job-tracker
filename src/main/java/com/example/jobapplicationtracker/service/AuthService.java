package com.example.jobapplicationtracker.service;

import com.example.jobapplicationtracker.dto.AuthResponse;
import com.example.jobapplicationtracker.dto.LoginRequest;
import com.example.jobapplicationtracker.dto.RegisterRequest;
import com.example.jobapplicationtracker.model.PasswordResetToken;
import com.example.jobapplicationtracker.model.RefreshToken;
import com.example.jobapplicationtracker.model.User;
import com.example.jobapplicationtracker.repository.PasswordResetTokenRepository;
import com.example.jobapplicationtracker.repository.RefreshTokenRepository;
import com.example.jobapplicationtracker.repository.UserRepository;
import com.example.jobapplicationtracker.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;




    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        userRepository.save(user);

        String accessToken = jwtUtil.generateToken(user.getEmail());
        String refreshToken = createRefreshToken(user);
        return new AuthResponse(accessToken, refreshToken, user.getEmail(), user.getFullName());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String accessToken = jwtUtil.generateToken(user.getEmail());
        String refreshToken = createRefreshToken(user);
        return new AuthResponse(accessToken, refreshToken, user.getEmail(), user.getFullName());
    }

    public AuthResponse refresh(String refreshTokenValue) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(refreshTokenValue)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (storedToken.isRevoked() || storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Refresh token expired or revoked");
        }

        User user = storedToken.getUser();

        // Rotate: revoke the old one, issue a new one
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        String newAccessToken = jwtUtil.generateToken(user.getEmail());
        String newRefreshToken = createRefreshToken(user);
        return new AuthResponse(newAccessToken, newRefreshToken, user.getEmail(), user.getFullName());
    }

    public void logout(String refreshTokenValue) {
        refreshTokenRepository.findByToken(refreshTokenValue)
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                });
    }

    private String createRefreshToken(User user) {
        String tokenValue = UUID.randomUUID().toString();
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(user);
        refreshToken.setToken(tokenValue);
        refreshToken.setExpiresAt(LocalDateTime.now().plusDays(7));
        refreshToken.setRevoked(false);
        refreshTokenRepository.save(refreshToken);
        return tokenValue;

    }

    // add passwordResetTokenRepository as a constructor parameter too, e.g.:
    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager,
                       RefreshTokenRepository refreshTokenRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
    }

    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with that email"));

        String tokenValue = UUID.randomUUID().toString();

        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setUser(user);
        resetToken.setToken(tokenValue);
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(30));
        resetToken.setUsed(false);
        passwordResetTokenRepository.save(resetToken);

        // In production this would be emailed, not returned directly.
        // Returning it here for local testing/demo purposes only.
        return tokenValue;
    }

    public void resetPassword(String tokenValue, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));

        if (resetToken.isUsed() || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Reset token expired or already used");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);
    }
}
