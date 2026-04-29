package com.iheb.gestion_universite.teaching.teacher.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record TeacherResponse(
        Long id,
        String matricule,
        String firstName,
        String lastName,
        String fullName,
        String email,
        String cin,
        String phone,
        String gender,
        String grade,
        String status,
        LocalDate hireDate,
        Instant createdAt,
        Long departmentId,
        String departmentName,
        Long specialityId,
        String specialityName,
        List<String> subjects,
        long assignedClassesCount
) {
}
