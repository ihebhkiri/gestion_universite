package com.iheb.gestion_universite.teaching.timetable.dto;

import com.iheb.gestion_universite.teaching.timetable.CourseSessionType;

import java.time.DayOfWeek;
import java.time.LocalTime;

public record TimetableResponse(
        Long id,
        DayOfWeek dayOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        CourseSessionType sessionType,
        Long courseId,
        String courseCode,
        String courseTitle,
        Long teacherId,
        String teacherName,
        Long roomId,
        String roomCode,
        String roomName,
        Long academicClassId,
        String academicClassCode,
        Long semesterId,
        String semesterName
) {
}
