package com.iheb.gestion_universite.student_managment.student_group.dto;

public record GroupResponse(
        Long id,
        String name,
        int capacity,
        long enrolledStudents,
        long availableSeats,
        Long classId,
        String classCode
) {}
