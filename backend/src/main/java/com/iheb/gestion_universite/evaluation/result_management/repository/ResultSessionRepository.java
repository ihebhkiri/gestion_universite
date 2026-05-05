package com.iheb.gestion_universite.evaluation.result_management.repository;

import com.iheb.gestion_universite.evaluation.result_management.entity.ResultSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ResultSessionRepository extends JpaRepository<ResultSessionEntity, Long> {

    boolean existsByExamId(Long examId);

    Optional<ResultSessionEntity> findByExamId(Long examId);

    @Query("""
            select session
            from ResultSessionEntity session
            join fetch session.exam exam
            left join fetch exam.course course
            left join fetch exam.academicClass academicClass
            left join fetch exam.studentGroup studentGroup
            left join fetch exam.semester semester
            order by session.createdAt desc
            """)
    List<ResultSessionEntity> findAllWithExam();

    @Query("""
            select session
            from ResultSessionEntity session
            join fetch session.exam exam
            left join fetch exam.course course
            left join fetch exam.academicClass academicClass
            left join fetch exam.studentGroup studentGroup
            left join fetch exam.semester semester
            where session.id = :sessionId
            """)
    Optional<ResultSessionEntity> findByIdWithExam(@Param("sessionId") Long sessionId);
}
