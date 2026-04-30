package com.iheb.gestion_universite.attendance.dto;

public record AttendanceSummaryResponse(
        long total,
        long present,
        long absent,
        long late,
        long excused,
        double attendanceRate
) {}
