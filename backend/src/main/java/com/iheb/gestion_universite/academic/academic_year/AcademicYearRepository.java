package com.iheb.gestion_universite.academic.academic_year;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AcademicYearRepository extends JpaRepository<AcademicYearEntity, Long> {
    boolean existsByLabel(String label);
    boolean existsByLabelIgnoreCase(String label);
    boolean existsByActiveTrue();
    long countByActiveTrue();
}
