package com.iheb.gestion_universite.academic.academic_class.dto;

import com.iheb.gestion_universite.academic.academic_class.Session;

public record AcademicClassDataResponse(
        Long id,
        String code,
        int level,
        Session session,
        Long programId,
        String programCode,
        String programName,
        Long specialityId,
        String specialityCode,
        String specialityName,
        Long academicYearId,
        String academicYearLabel
) {
}
