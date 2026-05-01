package com.iheb.gestion_universite.evaluation.exam;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface ExamRepo extends JpaRepository<ExamEntity, Long> {

    boolean existsByCourseIdAndTitleAndTypeAndSessionType (Long courseId, String title, ExamType type, SessionType session);

    @Query("""
            select exam
            from ExamEntity exam
            left join fetch exam.course course
            left join fetch exam.academicClass academicClass
            left join fetch exam.studentGroup studentGroup
            left join fetch exam.room room
            left join fetch exam.supervisor supervisor
            left join fetch exam.semester semester
            left join fetch semester.academicYear academicYear
            """)
    List<ExamEntity> findAllWithRelations();

    @Query("""
            select exam
            from ExamEntity exam
            left join fetch exam.course course
            left join fetch exam.academicClass academicClass
            left join fetch exam.studentGroup studentGroup
            left join fetch exam.room room
            left join fetch exam.supervisor supervisor
            left join fetch exam.semester semester
            where exam.status <> com.iheb.gestion_universite.evaluation.exam.ExamStatus.CANCELLED
              and exam.examDate = :examDate
              and exam.startTime < :endTime
              and exam.endTime > :startTime
              and (:excludedId is null or exam.id <> :excludedId)
            """)
    List<ExamEntity> findActiveOverlapping(
            @Param("examDate") LocalDate examDate,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime,
            @Param("excludedId") Long excludedId
    );
}
