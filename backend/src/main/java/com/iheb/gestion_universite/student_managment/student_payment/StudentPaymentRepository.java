package com.iheb.gestion_universite.student_managment.student_payment;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentPaymentRepository extends JpaRepository<StudentPaymentEntity, Long> {

    List<StudentPaymentEntity> findByStudentIdOrderByPaymentDateDescIdDesc(Long studentId);
}
