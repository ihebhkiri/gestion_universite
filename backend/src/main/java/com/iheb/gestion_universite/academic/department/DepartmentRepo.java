package com.iheb.gestion_universite.academic.department;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepo extends JpaRepository<DepartmentEntity, Long> {
    boolean existsByName(String name);
    boolean existsByCode(String code);
}
