package com.iheb.gestion_universite.attendance.dto;

import com.iheb.gestion_universite.attendance.entity.AttendanceSessionStatus;

import java.time.LocalDate;
import java.time.LocalTime;

public record AttendanceSessionResponse(
        Long id,
        String title,
        String sessionCode,
        LocalDate sessionDate,
        LocalTime startTime,
        LocalTime endTime,
        AttendanceSessionStatus status,
        Long courseId,
        String courseCode,
        String courseTitle,
        Long academicClassId,
        String academicClassCode,
        Long teacherId,
        String teacherName,
        Long timetableEntryId,
        LocalTime scheduledStartTime,
        LocalTime scheduledEndTime,
        AttendanceSummaryResponse summary
) {}
