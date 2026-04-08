package com.iheb.gestion_universite.security.auth.repositories;

import com.iheb.gestion_universite.security.auth.models.RefreshTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepo extends JpaRepository<RefreshTokenEntity,Long> {
    Optional<RefreshTokenEntity> findByToken (String request);
}
