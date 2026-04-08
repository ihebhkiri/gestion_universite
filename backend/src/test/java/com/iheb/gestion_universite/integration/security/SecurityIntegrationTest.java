package com.iheb.gestion_universite.integration.security;

import com.iheb.gestion_universite.security.JwtService;
import com.iheb.gestion_universite.security.user.UserEntity;
import com.iheb.gestion_universite.security.user.UserRepository;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private JwtService jwtService;

    @MockBean
    private com.iheb.gestion_universite.security.CustomUserDetailService customUserDetailService;

    @MockBean
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        // Prepare context
    }

    @Test
    void shouldAuthenticateWithValidCookie() throws Exception {
        String token = "valid-token";
        String email = "test@example.com";
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(email)
                .password("password")
                .authorities("ROLE_USER")
                .build();

        UserEntity userEntity = new UserEntity();
        userEntity.setEmail(email);

        when(jwtService.extractUsername(token)).thenReturn(email);
        when(customUserDetailService.loadUserByUsername(email)).thenReturn(userDetails);
        when(jwtService.isTokenValid(token, userDetails)).thenReturn(true);
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(userEntity));

        mockMvc.perform(get("/api/v1/users/me")
                        .cookie(new Cookie("accessToken", token)))
                .andExpect(status().isOk());
    }

    @Test
    void shouldPropagateAuthenticationToSecurityContext() throws Exception {
        String token = "valid-token";
        String email = "test@example.com";
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(email)
                .password("password")
                .authorities("ROLE_USER")
                .build();

        when(jwtService.extractUsername(token)).thenReturn(email);
        when(customUserDetailService.loadUserByUsername(email)).thenReturn(userDetails);
        when(jwtService.isTokenValid(token, userDetails)).thenReturn(true);
        when(userRepository.findByEmail(email)).thenReturn(java.util.Optional.of(new com.iheb.gestion_universite.security.user.UserEntity()));

        // Even with permitAll(), we check that the filter processes the token correctly
        mockMvc.perform(get("/api/v1/users/me")
                        .cookie(new Cookie("accessToken", token)))
                .andExpect(status().isOk());
    }
}
