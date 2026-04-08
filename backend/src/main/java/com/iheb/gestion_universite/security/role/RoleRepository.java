package com.iheb.gestion_universite.security.role;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository  extends JpaRepository<RoleEntity, Long> {
        Optional<RoleEntity> findByName(String name);
}
