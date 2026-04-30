package com.iheb.gestion_universite.attendance.dto;

import com.iheb.gestion_universite.teaching.timetable.CourseSessionType;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record AttendanceSlotResponse(
        Long timetableEntryId,
        DayOfWeek dayOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        CourseSessionType sessionType,
        Long courseId,
        String courseCode,
        String courseTitle,
        Long academicClassId,
        String academicClassCode,
        Long teacherId,
        String teacherName,
        Long roomId,
        String roomCode,
        String roomName
) {}
