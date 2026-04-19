package com.iheb.gestion_universite.security.auth.services;


import com.iheb.gestion_universite.core.exceptions.*;
import com.iheb.gestion_universite.security.UserPrincipal;
import com.iheb.gestion_universite.security.auth.dto.LoginRequest;
import com.iheb.gestion_universite.security.auth.dto.LoginResponse;
import com.iheb.gestion_universite.security.auth.dto.RefreshTokenResponse;
import com.iheb.gestion_universite.security.auth.models.PasswordResetTokenEntity;
import com.iheb.gestion_universite.security.auth.repositories.PassResetRepo;
import com.iheb.gestion_universite.security.auth.repositories.RefreshTokenRepo;
import com.iheb.gestion_universite.security.CustomUserDetailService;
import com.iheb.gestion_universite.security.JwtService;
import com.iheb.gestion_universite.security.user.UserRepository;
import com.iheb.gestion_universite.security.user.dto.Me;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;


@Service
@RequiredArgsConstructor

public class AuthService {


    @Value ("${reset.token.expiration}")
    private long resetTokenExpiration;


    private final UserRepository userRepository;

    private final AuthenticationManager authenticationManager;

    private final JwtService jwtService;

    private final PassResetRepo passRepo;

    private final MailService mailService;

    private final PasswordEncoder passwordEncoder;

    private final RefreshTokenRepo refreshTokenRepo;

    private final CustomUserDetailService customUserDetailService;

    private final RefreshTokenService refreshTokenService;

    public LoginResponse login (LoginRequest loginRequest) {

        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password()));
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        var claims = createUserRoles(userDetails);
        String accessToken = jwtService.generateToken(claims, userDetails);
        String refreshToken = refreshTokenService.generateRefreshToken(userDetails);
        return new LoginResponse(accessToken, refreshToken);
    }


    public void forgotPassword (String email) {

        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        String resetToken = UUID.randomUUID()
                .toString();
        PasswordResetTokenEntity passReset = PasswordResetTokenEntity.builder()
                .token(resetToken)
                .user(user)
                .expiryDate(Instant.now()
                        .plusSeconds(resetTokenExpiration))
                .build();
        passRepo.save(passReset);
        try {
            mailService.sendResetMail(email, resetToken);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Transactional
    public void resetPassword (String password, String confirmPassword, String token) {

        var passReset = passRepo.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Invalid token"));
        if (passReset.getExpiryDate()
                .isBefore(Instant.now())) {
            throw new TokenExpiredException("Token expired");
        }
        if (password == null || confirmPassword == null || !password.equals(confirmPassword)) {
            throw new PasswordMismatchException("Passwords do not match");
        }
        var user = passReset.getUser();
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);
    }

    @Transactional
    public RefreshTokenResponse refreshToken (String request) {

        var refreshToken = refreshTokenRepo.findByToken(request)
                .orElseThrow(() -> new RefreshTokenNotFoundException("Invalid refresh token"));

        if (refreshToken.getExpiryDate()
                .isBefore(Instant.now())) {
            refreshToken.setValid(false);
            refreshTokenRepo.save(refreshToken);

            throw new RefreshTokenExpiredException("Refresh token expired");
        }
        if (!refreshToken.isValid()) {
            throw new InvalidRefreshTokenException("Invalid refresh token");
        }
        refreshToken.setValid(false);
        refreshTokenRepo.save(refreshToken);
        String userEmail = refreshToken.getUser()
                .getEmail();
        UserDetails userDetails = customUserDetailService.loadUserByUsername(userEmail);
        var claims = createUserRoles(userDetails);
        String accessToken = jwtService.generateToken(claims, userDetails);
        String newRefreshToken = refreshTokenService.generateRefreshToken(userDetails);
        return new RefreshTokenResponse(newRefreshToken, accessToken);

    }


    private Map<String, Object> createUserRoles (UserDetails userDetails) {

        var user = userRepository.findByEmailWithRoles(userDetails.getUsername())
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        Map<String, Object> claims = new HashMap<>();
        var roles = user.getRoles()
                .stream()
                .map(role -> role.getName())
                .toList();
        claims.put("roles", roles);
        return claims;

    }


    public Me getCurrentUser (UserPrincipal principal) {
        var user = principal.getUser();
        return new Me(user.getEmail(), user.getRoles()
                .stream()
                .map(role -> role.getName())
                .collect(java.util.stream.Collectors.toSet()));

    }
}
