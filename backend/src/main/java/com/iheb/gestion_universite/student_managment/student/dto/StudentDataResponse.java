package com.iheb.gestion_universite.student_managment.student.dto;

import java.time.LocalDate;

public record StudentDataResponse(
        Long id,
        String matricule,
        String firstName,
        String lastName,
        String gender,
        String cin,
        String phone,
        String email,
        String profileImage,
        String activeGroup,
        String status,
        LocalDate enrollmentDate,
        java.time.Instant createdAt,
        java.time.Instant updatedAt
) {}
