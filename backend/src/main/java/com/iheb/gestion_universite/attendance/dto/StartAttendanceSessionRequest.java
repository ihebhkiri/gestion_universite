package com.iheb.gestion_universite.attendance.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record StartAttendanceSessionRequest(
        @NotNull Long timetableEntryId,
        Long courseId,
        Long academicClassId,
        Long teacherId,
        String title,
        LocalDate sessionDate
) {}
