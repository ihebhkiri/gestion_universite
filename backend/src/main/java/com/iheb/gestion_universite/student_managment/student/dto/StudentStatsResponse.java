package com.iheb.gestion_universite.student_managment.student.dto;

public record StudentStatsResponse(
        long totalStudents,
        long activeEnrollments,
        long newThisMonth,
        long totalGroups
) {}
