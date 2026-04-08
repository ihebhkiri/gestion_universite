package com.iheb.gestion_universite.security.auth.models;


import com.iheb.gestion_universite.security.user.UserEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table (name = "password_reset_tokens")
public class PasswordResetTokenEntity {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @Column (nullable = false ,unique = true)
    private String token;

    @Column (nullable = false)
    private Instant expiryDate;

    @ManyToOne
    @JoinColumn (name = "user_id", nullable = false)
    private UserEntity user;

}
