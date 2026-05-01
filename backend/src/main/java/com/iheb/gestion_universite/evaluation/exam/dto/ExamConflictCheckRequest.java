package com.iheb.gestion_universite.evaluation.exam.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;

public record ExamConflictCheckRequest(
        Long examId,

        @NotNull(message = "Exam date is required")
        LocalDate examDate,

        @NotNull(message = "Start time is required")
        LocalTime startTime,

        @NotNull(message = "End time is required")
        LocalTime endTime,

        Long roomId,
        Long classId,
        Long groupId,
        Long supervisorId
) {}
