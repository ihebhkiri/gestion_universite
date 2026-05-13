package com.iheb.gestion_universite.student_managment.student.dto;

public record StudentProfileResponse(
        String matricule,
        String fullName,
        String email,
        String phoneNumber,
        String cin,
        String academicClassCode,
        String program,
        String status,
        String avatarUrl
) {
}
