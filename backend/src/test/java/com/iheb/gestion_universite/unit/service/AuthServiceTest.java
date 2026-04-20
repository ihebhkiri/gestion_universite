package com.iheb.gestion_universite.unit.service;

import com.iheb.gestion_universite.security.role.RoleEntity;
import com.iheb.gestion_universite.core.exceptions.*;
import com.iheb.gestion_universite.security.CustomUserDetailService;
import com.iheb.gestion_universite.security.JwtService;
import com.iheb.gestion_universite.security.auth.dto.LoginRequest;
import com.iheb.gestion_universite.security.auth.dto.LoginResponse;
import com.iheb.gestion_universite.security.auth.dto.RefreshTokenResponse;
import com.iheb.gestion_universite.security.auth.models.PasswordResetTokenEntity;
import com.iheb.gestion_universite.security.auth.models.RefreshTokenEntity;
import com.iheb.gestion_universite.security.auth.repositories.PassResetRepo;
import com.iheb.gestion_universite.security.auth.repositories.RefreshTokenRepo;
import com.iheb.gestion_universite.security.auth.services.AuthService;
import com.iheb.gestion_universite.security.auth.services.MailService;
import com.iheb.gestion_universite.security.auth.services.RefreshTokenService;
import com.iheb.gestion_universite.security.user.UserEntity;
import com.iheb.gestion_universite.security.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.util.Collections;
import java.util.Set;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith (MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private PassResetRepo passRepo;

    @Mock
    private MailService mailService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private RefreshTokenRepo refreshTokenRepo;

    @Mock
    private CustomUserDetailService customUserDetailService;

    @Mock
    private RefreshTokenService refreshTokenService;

    @InjectMocks
    private AuthService authService;

    private final String email = "test@example.com";

    private final String password = "password123";

    @BeforeEach
    void setUp () {

        ReflectionTestUtils.setField(authService, "resetTokenExpiration", 3600);
    }

    @Test
    void shouldLoginSuccessfully () {

        LoginRequest loginRequest = new LoginRequest(email, password);
        Authentication authentication = mock(Authentication.class);
        UserDetails userDetails = mock(UserDetails.class);

        UserEntity user = new UserEntity();
        user.setEmail(email);
        RoleEntity role = RoleEntity.builder().name("ROLE_USER").build();
        user.setRoles(Set.of(role));

        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn(email);
        when(userRepository.findByEmailWithRoles(email)).thenReturn(Optional.of(user));
        when(jwtService.generateToken(argThat(map -> map.containsKey("roles")), eq(userDetails))).thenReturn("accessToken");
        when(refreshTokenService.generateRefreshToken(userDetails)).thenReturn("refreshToken");

        LoginResponse response = authService.login(loginRequest);
        assertNotNull(response);
        assertEquals("accessToken", response.accessToken());
        assertEquals("refreshToken", response.refreshToken());
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtService).generateToken(argThat(map -> map.containsKey("roles")), eq(userDetails));
    }

    @Test
    void shouldThrowExceptionWhenLoginFails () {

        LoginRequest loginRequest = new LoginRequest(email, "wrongPassword");
        when(authenticationManager.authenticate(any())).thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> authService.login(loginRequest));
    }

    @Test
    void shouldInitiateForgotPassword () throws Exception {

        UserEntity user = new UserEntity();
        user.setEmail(email);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        authService.forgotPassword(email);

        verify(passRepo).save(any(PasswordResetTokenEntity.class));
        verify(mailService).sendResetMail(eq(email), anyString());
    }

    @Test
    void shouldThrowExceptionWhenForgotPasswordUserNotFound () {

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        assertThrows(UserNotFoundException.class, () -> authService.forgotPassword(email));
    }

    @Test
    void shouldResetPasswordSuccessfully () {

        String token = "reset-token";
        UserEntity user = new UserEntity();
        PasswordResetTokenEntity resetToken = PasswordResetTokenEntity.builder()
                .token(token)
                .user(user)
                .expiryDate(Instant.now()
                        .plusSeconds(3600))
                .build();

        when(passRepo.findByToken(token)).thenReturn(Optional.of(resetToken));
        when(passwordEncoder.encode(password)).thenReturn("encodedPassword");

        authService.resetPassword(password, password, token);

        assertEquals("encodedPassword", user.getPassword());
        verify(userRepository).save(user);
    }

    @Test
    void shouldThrowExceptionWhenPasswordsDoNotMatch () {

        String token = "reset-token";
        PasswordResetTokenEntity resetToken = PasswordResetTokenEntity.builder()
                .token(token)
                .expiryDate(Instant.now()
                        .plusSeconds(3600))
                .build();

        when(passRepo.findByToken(token)).thenReturn(Optional.of(resetToken));

        assertThrows(PasswordMismatchException.class, () -> authService.resetPassword(password, "different", token));
    }

    @Test
    void shouldRefreshTokenSuccessfully () {

        String refreshTokenStr = "valid-refresh-token";
        UserEntity user = new UserEntity();
        user.setEmail(email);
        RoleEntity role = RoleEntity.builder().name("ROLE_USER").build();
        user.setRoles(Set.of(role));
        RefreshTokenEntity refreshToken = RefreshTokenEntity.builder()
                .token(refreshTokenStr)
                .user(user)
                .isValid(true)
                .expiryDate(Instant.now()
                        .plusSeconds(3600))
                .creationDate(Instant.now())
                .build();

        UserDetails userDetails = mock(UserDetails.class);
        when(refreshTokenRepo.findByToken(refreshTokenStr)).thenReturn(Optional.of(refreshToken));
        when(customUserDetailService.loadUserByUsername(email)).thenReturn(userDetails);
        when(userDetails.getUsername()).thenReturn(email);
        when(userRepository.findByEmailWithRoles(email)).thenReturn(Optional.of(user));
        when(jwtService.generateToken(anyMap(), eq(userDetails))).thenReturn("newAccessToken");
        when(refreshTokenService.generateRefreshToken(userDetails)).thenReturn("newRefreshToken");

        RefreshTokenResponse response = authService.refreshToken(refreshTokenStr);

        assertNotNull(response);
        assertEquals("newAccessToken", response.accessToken());
        assertEquals("newRefreshToken", response.refreshToken());
        assertFalse(refreshToken.isValid());
        verify(refreshTokenRepo, times(1)).save(refreshToken);
        verify(refreshTokenService).generateRefreshToken(userDetails);
    }

    @Test
    void shouldThrowExceptionWhenRefreshTokenExpired () {

        String refreshTokenStr = "expired-token";
        RefreshTokenEntity refreshToken = RefreshTokenEntity.builder()
                .token(refreshTokenStr)
                .isValid(true)
                .expiryDate(Instant.now()
                        .minusSeconds(10))
                .creationDate(Instant.now())
                .build();

        when(refreshTokenRepo.findByToken(refreshTokenStr)).thenReturn(Optional.of(refreshToken));

        assertThrows(RefreshTokenExpiredException.class, () -> authService.refreshToken(refreshTokenStr));
        assertFalse(refreshToken.isValid());
        verify(refreshTokenRepo).save(refreshToken);
    }
}
