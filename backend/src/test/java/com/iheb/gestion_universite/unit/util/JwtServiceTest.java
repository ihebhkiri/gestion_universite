package com.iheb.gestion_universite.unit.util;

import com.iheb.gestion_universite.security.CustomUserDetailService;
import com.iheb.gestion_universite.security.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    private JwtService jwtService;

    @Mock
    private CustomUserDetailService customUserDetailService;

    @Mock
    private UserDetails userDetails;

    private final String secretKey = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private final long expiration = 900000; // 15 mins

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(customUserDetailService);
        ReflectionTestUtils.setField(jwtService, "secretKey", secretKey);
        ReflectionTestUtils.setField(jwtService, "jwtExpirationInMs", expiration);
    }

    @Test
    void shouldGenerateToken() {
        when(userDetails.getUsername()).thenReturn("test@example.com");

        String token = jwtService.generateToken(userDetails);

        assertNotNull(token);
        assertEquals("test@example.com", jwtService.extractUsername(token));
    }

    @Test
    void shouldGenerateTokenWithExtraClaims() {
        when(userDetails.getUsername()).thenReturn("test@example.com");
        Map<String, Object> extraClaims = Collections.singletonMap("role", "ADMIN");

        String token = jwtService.generateToken(extraClaims, userDetails);

        assertNotNull(token);
        Claims claims = jwtService.extractAllClaims(token);
        assertEquals("ADMIN", claims.get("role"));
        assertEquals("test@example.com", claims.getSubject());
    }

    @Test
    void shouldValidateToken() {
        when(userDetails.getUsername()).thenReturn("test@example.com");
        String token = jwtService.generateToken(userDetails);

        assertTrue(jwtService.isTokenValid(token, userDetails));
    }

    @Test
    void shouldInvalidateTokenForDifferentUser() {
        when(userDetails.getUsername()).thenReturn("test@example.com");
        String token = jwtService.generateToken(userDetails);

        UserDetails otherUser = org.mockito.Mockito.mock(UserDetails.class);
        when(otherUser.getUsername()).thenReturn("other@example.com");

        assertFalse(jwtService.isTokenValid(token, otherUser));
    }

    @Test
    void shouldCheckTokenExpiration() {
        when(userDetails.getUsername()).thenReturn("test@example.com");
        
        ReflectionTestUtils.setField(jwtService, "jwtExpirationInMs", -1000L);
        String token = jwtService.generateToken(userDetails);
        assertThrows(ExpiredJwtException.class,()->jwtService.isTokenExpired(token));

        ReflectionTestUtils.setField(jwtService, "jwtExpirationInMs", expiration);
    }
}
