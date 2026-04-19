package com.iheb.gestion_universite.security.auth;


import com.iheb.gestion_universite.security.JwtService;
import com.iheb.gestion_universite.security.UserPrincipal;
import com.iheb.gestion_universite.security.auth.dto.ForgotPasswordRequest;
import com.iheb.gestion_universite.security.auth.dto.LoginRequest;
import com.iheb.gestion_universite.security.auth.dto.ResetPasswordRequest;
import com.iheb.gestion_universite.security.auth.services.AuthService;
import com.iheb.gestion_universite.security.user.UserRepository;
import com.iheb.gestion_universite.security.user.dto.Me;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping ("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    @Value ("${refresh.token.expiration}")
    private long refreshTokenExpiration;
    @Value ("${access.token.expiration}")
    private long accessTokenExpiration;

    private final AuthService authService;

    private final UserRepository userRepository;

    private final JwtService jwtService;

    @PostMapping ("/login")
    public ResponseEntity<Void> login (@Valid @RequestBody LoginRequest loginRequest) {

        var tokens = authService.login(loginRequest);
        var jwtCookie = createAccessTokenCookie(tokens.accessToken(), 900L);
        ResponseCookie refreshTokenCookie = createRefreshTokenCookie(tokens.refreshToken(), 604800L);
        return ResponseEntity.status(204)
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
                .build();

    }

    @PostMapping ("/forgot-password")
    public ResponseEntity<Void> forgotPassword (@Valid @RequestBody ForgotPasswordRequest request) {

        authService.forgotPassword(request.email());
        return ResponseEntity.status(204)
                .build();
    }

    @PostMapping ("/reset-password")
    public ResponseEntity<Void> resetPassword (@Valid @RequestBody ResetPasswordRequest request) {

        authService.resetPassword(request.password(), request.confirmPassword(), request.token());
        return ResponseEntity.status(204)
                .build();
    }

    @PostMapping ("/refresh")
    public ResponseEntity<Void> refreshToken (@CookieValue ("refreshToken") String refreshToken) {

        var tokens = authService.refreshToken(refreshToken);

        ResponseCookie jwtCookie = createAccessTokenCookie(tokens.accessToken(), 900L);

        ResponseCookie refreshTokenCookie = createRefreshTokenCookie(tokens.refreshToken(), 604800L);
        return ResponseEntity.status(204)
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
                .build();
    }
    @GetMapping ("/me")
    public ResponseEntity<Me> getCurrentUser (@AuthenticationPrincipal UserPrincipal principal) {
        Me me = authService.getCurrentUser(principal);
        return ResponseEntity.ok(me);
    }



    @PostMapping ("/logout")
    public ResponseEntity<Void> logout () {

        ResponseCookie jwtCookie = createAccessTokenCookie("", 0L);

        ResponseCookie refreshTokenCookie = createRefreshTokenCookie("", 0L);

        return ResponseEntity.status(204)
                .header(HttpHeaders.SET_COOKIE, jwtCookie.toString())
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookie.toString())
                .build();
    }


    private ResponseCookie createAccessTokenCookie (String token, Long maxAge) {

        return ResponseCookie.from("accessToken", token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(maxAge)
                .sameSite("None")
                .build();
    }

    private ResponseCookie createRefreshTokenCookie (String token, Long maxAge) {

        return ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .secure(true)
                .path("/api/v1/auth/refresh")
                .maxAge(maxAge)
                .sameSite("None")
                .build();
    }

}
