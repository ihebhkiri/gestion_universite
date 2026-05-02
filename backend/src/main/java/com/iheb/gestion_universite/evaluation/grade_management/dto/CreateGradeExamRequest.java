package com.iheb.gestion_universite.evaluation.grade_management.dto;

import com.iheb.gestion_universite.evaluation.exam.ExamStatus;
import com.iheb.gestion_universite.evaluation.exam.ExamType;
import com.iheb.gestion_universite.evaluation.exam.SessionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;
import java.time.LocalTime;

public record CreateGradeExamRequest(
        @NotBlank(message = "Title is required")
        String title,

        @NotNull(message = "Course is required")
        Long courseId,

        @NotNull(message = "Class is required")
        Long classId,

        Long groupId,
        Long roomId,
        Long supervisorId,
        Long semesterId,
        LocalDate examDate,
        LocalTime startTime,
        LocalTime endTime,

        @NotNull(message = "Exam type is required")
        ExamType type,

        SessionType sessionType,
        ExamStatus status,

        @Positive(message = "Duration must be positive")
        Double duration,

        @Positive(message = "Weight must be positive")
        Double weight,

        @DecimalMin(value = "1.0", message = "Max score must be greater than 0")
        Double maxScore,

        String instructions
) {}
