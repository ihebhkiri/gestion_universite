package com.iheb.gestion_universite.attendance.repository;

import com.iheb.gestion_universite.attendance.entity.AttendanceRecordEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecordEntity, Long> {

    @Query("""
            select record
            from AttendanceRecordEntity record
            join fetch record.student student
            where record.session.id = :sessionId
            order by student.lastName asc, student.firstName asc
            """)
    List<AttendanceRecordEntity> findBySessionIdOrderByStudentName(@Param("sessionId") Long sessionId);

    @Query("""
            select record
            from AttendanceRecordEntity record
            join fetch record.student student
            join fetch record.session session
            left join fetch session.course course
            left join fetch session.teacher teacher
            left join fetch session.academicClass academicClass
            left join fetch academicClass.academicYear academicYear
            left join fetch session.timetableEntry timetableEntry
            left join fetch timetableEntry.semester semester
            """)
    List<AttendanceRecordEntity> findAllForAnalytics();
}
