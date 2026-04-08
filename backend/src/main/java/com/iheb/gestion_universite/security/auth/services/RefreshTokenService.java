package com.iheb.gestion_universite.security.auth.services;

import com.iheb.gestion_universite.security.auth.models.RefreshTokenEntity;
import com.iheb.gestion_universite.security.auth.repositories.RefreshTokenRepo;
import com.iheb.gestion_universite.core.exceptions.UserNotFoundException;
import com.iheb.gestion_universite.security.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenService {
    private final RefreshTokenRepo refreshTokenRepo;
    private final UserRepository userRepository;
   public String generateRefreshToken (UserDetails userDetails) {

        String refreshToken = UUID.randomUUID()
                .toString();
        RefreshTokenEntity refreshTokenEntity = RefreshTokenEntity.builder()
                .token(refreshToken)
                .user(userRepository.findByEmail(userDetails.getUsername())
                        .orElseThrow(() -> new UserNotFoundException("User not found")))
                .creationDate(Instant.now())
                .expiryDate(Instant.now()
                        .plusSeconds(604800))
                .build();
        refreshTokenRepo.save(refreshTokenEntity);
        return refreshToken;
    }

}
