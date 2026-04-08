package com.iheb.gestion_universite.security.auth.repositories;

import com.iheb.gestion_universite.security.auth.models.PasswordResetTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PassResetRepo extends JpaRepository<PasswordResetTokenEntity, Long> {

     Optional<PasswordResetTokenEntity> findByToken (String token);
}
