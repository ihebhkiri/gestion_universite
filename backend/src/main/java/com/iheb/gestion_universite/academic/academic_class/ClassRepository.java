package com.iheb.gestion_universite.academic.academic_class;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ClassRepository extends JpaRepository<AcademicClassEntity, Long> {
    boolean existsByCode(String code);
    boolean existsByLevelAndSessionAndProgramIdAndSpecialityIdAndAcademicYearId(
            int level, Session session, Long programId, Long specialityId, Long academicYearId);
}
