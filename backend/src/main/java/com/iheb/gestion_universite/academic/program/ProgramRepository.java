package com.iheb.gestion_universite.academic.program;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProgramRepository extends JpaRepository<ProgramEntity, Long> {
    boolean existsByCode(String code);
    boolean existsByName(String name);
}
