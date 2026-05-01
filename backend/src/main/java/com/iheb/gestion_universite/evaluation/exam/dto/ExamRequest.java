package com.iheb.gestion_universite.evaluation.exam.dto;

import com.iheb.gestion_universite.evaluation.exam.ExamStatus;
import com.iheb.gestion_universite.evaluation.exam.ExamType;
import com.iheb.gestion_universite.evaluation.exam.SessionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;
import java.time.LocalTime;

public record ExamRequest(
        @NotBlank(message = "Title is required")
        String title,

        @NotNull(message = "Course is required")
        Long courseId,

        @NotNull(message = "Class is required")
        Long classId,

        Long groupId,

        @NotNull(message = "Room is required")
        Long roomId,

        @NotNull(message = "Supervisor is required")
        Long supervisorId,

        @NotNull(message = "Semester is required")
        Long semesterId,

        @NotNull(message = "Exam date is required")
        LocalDate examDate,

        @NotNull(message = "Start time is required")
        LocalTime startTime,

        @NotNull(message = "End time is required")
        LocalTime endTime,

        @NotNull(message = "Exam type is required")
        ExamType type,

        SessionType sessionType,

        ExamStatus status,

        @Positive(message = "Duration must be positive")
        Double duration,

        @Positive(message = "Weight must be positive")
        Double weight,

        String instructions
) {}
