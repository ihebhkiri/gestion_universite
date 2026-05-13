package com.iheb.gestion_universite.attendance.dto;

import com.iheb.gestion_universite.attendance.entity.AttendanceStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public record StudentAttendanceResponse(
        Long id,
        Long courseId,
        String courseCode,
        String courseName,
        Long subjectId,
        String subjectName,
        Long teacherId,
        String teacherName,
        LocalDate sessionDate,
        LocalTime startTime,
        LocalTime endTime,
        String room,
        AttendanceStatus status,
        String period,
        Boolean justified,
        String justificationStatus,
        Instant recordedAt
) {}
