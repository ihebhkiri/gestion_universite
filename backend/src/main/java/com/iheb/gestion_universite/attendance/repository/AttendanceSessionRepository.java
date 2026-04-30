package com.iheb.gestion_universite.attendance.repository;

import com.iheb.gestion_universite.attendance.entity.AttendanceSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AttendanceSessionRepository extends JpaRepository<AttendanceSessionEntity, Long> {

    List<AttendanceSessionEntity> findByAcademicClassIdOrderBySessionDateDescStartTimeDesc(Long academicClassId);

    List<AttendanceSessionEntity> findByCourseIdOrderBySessionDateDescStartTimeDesc(Long courseId);

    List<AttendanceSessionEntity> findByAcademicClassIdAndCourseIdOrderBySessionDateDescStartTimeDesc(Long academicClassId, Long courseId);

    List<AttendanceSessionEntity> findAllByOrderBySessionDateDescStartTimeDesc();

    Optional<AttendanceSessionEntity> findBySessionCode(String sessionCode);

    boolean existsByTimetableEntryIdAndSessionDate(Long timetableEntryId, java.time.LocalDate sessionDate);
}
