package com.iheb.gestion_universite.academic.semester;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SemesterRepository extends JpaRepository<SemesterEntity, Long> {
    boolean existsByNameIgnoreCaseAndAcademicYearId(String name, Long academicYearId);
    boolean existsByNameIgnoreCaseAndAcademicYearIdAndIdNot(String name, Long academicYearId, Long id);
    long countByStatus(SemesterStatus status);
}

