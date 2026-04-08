package com.iheb.gestion_universite.security.user;


import com.iheb.gestion_universite.core.base_entity.BaseEntity;
import com.iheb.gestion_universite.security.role.RoleEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Getter
@Setter
@Table (name = "users")
public class UserEntity extends BaseEntity {

    @Id
    @GeneratedValue (strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToMany (fetch = FetchType.LAZY)
    @JoinTable (
            name = "user_roles",
            joinColumns = @JoinColumn (name = "user_id"),
            inverseJoinColumns = @JoinColumn (name = "role_id")
    )
    @Builder.Default
    private Set<RoleEntity> role = new HashSet<>();

    private String email;

    private String password;

    @Builder.Default
    @Column (nullable = false)
    private boolean enabled = true;


}