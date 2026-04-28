package com.iheb.gestion_universite.student_managment.student_enrollment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EnrollmentRepo extends JpaRepository<StudentEnrollmentEntity,Long> {
    boolean existsByStudent_IdAndStatus(Long studentId, EnrollmentStatus status);
    long countByStatus(EnrollmentStatus status);
    long countByEnrollmentDateAfter(java.time.LocalDate date);
    long countByGroupIdAndStatus(Long groupId, EnrollmentStatus status);
    List<StudentEnrollmentEntity> findByStudent_IdInAndStatus(List<Long> studentIds, EnrollmentStatus status);
}
