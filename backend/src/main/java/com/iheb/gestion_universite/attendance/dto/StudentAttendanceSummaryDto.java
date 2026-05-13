package com.iheb.gestion_universite.attendance.dto;

public record StudentAttendanceSummaryDto(
        long presentCount,
        long absentCount,
        long lateCount,
        long justifiedCount,
        Double attendanceRate
) {}
