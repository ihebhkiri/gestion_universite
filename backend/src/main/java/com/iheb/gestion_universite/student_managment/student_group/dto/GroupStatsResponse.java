package com.iheb.gestion_universite.student_managment.student_group.dto;

public record GroupStatsResponse(
        long totalGroups,
        long totalCapacity,
        long activeEnrollments
) {
}
