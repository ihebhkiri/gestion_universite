package com.iheb.gestion_universite.integration.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.iheb.gestion_universite.security.auth.dto.LoginRequest;
import com.iheb.gestion_universite.security.auth.repositories.RefreshTokenRepo;
import com.iheb.gestion_universite.security.user.UserEntity;
import com.iheb.gestion_universite.security.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles ("test")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private RefreshTokenRepo refreshTokenRepo;


    @MockBean
    private JavaMailSender javaMailSender;

    @BeforeEach
    void setUp () {

        refreshTokenRepo.deleteAll();
        userRepository.deleteAll();

        UserEntity user = new UserEntity();
        user.setEmail("admin@example.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setEnabled(true);
        userRepository.save(user);
    }

    @Test
    void shouldLoginAndReturnCookies () throws Exception {

        LoginRequest loginRequest = new LoginRequest("admin@example.com", "password123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isNoContent())
                .andExpect(cookie().exists("accessToken"))
                .andExpect(cookie().httpOnly("accessToken", true))
                .andExpect(cookie().exists("refreshToken"))
                .andExpect(cookie().httpOnly("refreshToken", true))
                .andExpect(cookie().path("refreshToken", "/api/v1/auth/refresh"))
                .andExpect(cookie().path("accessToken", "/"));
    }

    @Test
    void shouldReturnBadRequestForInvalidEmail () throws Exception {

        LoginRequest loginRequest = new LoginRequest("invalid-email", "password123");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldReturnUnauthorizedForInvalidCredentials () throws Exception {

        LoginRequest loginRequest = new LoginRequest("admin@example.com", "wrongpassword");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldLogoutAndClearCookies () throws Exception {

        mockMvc.perform(post("/api/v1/auth/logout"))
                .andExpect(status().isNoContent())
                .andExpect(cookie().value("accessToken", ""))
                .andExpect(cookie().maxAge("accessToken", 0))
                .andExpect(cookie().value("refreshToken", ""))
                .andExpect(cookie().maxAge("refreshToken", 0));
    }
}
