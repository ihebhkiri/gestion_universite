package com.iheb.gestion_universite.student_managment.student_enrollment;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EnrollmentRepo extends JpaRepository<StudentEnrollmentEntity,Long> {
    boolean existsByStudent_IdAndStatus(Long studentId, EnrollmentStatus status);

}
