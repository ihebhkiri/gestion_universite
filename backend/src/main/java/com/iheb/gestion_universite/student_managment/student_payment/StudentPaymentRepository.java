package com.iheb.gestion_universite.student_managment.student_payment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface StudentPaymentRepository extends JpaRepository<StudentPaymentEntity, Long> {

    List<StudentPaymentEntity> findByStudentIdOrderByPaymentDateDescIdDesc(Long studentId);

    @Query("""
            select year(payment.paymentDate), month(payment.paymentDate), sum(payment.amount)
            from StudentPaymentEntity payment
            group by year(payment.paymentDate), month(payment.paymentDate)
            order by year(payment.paymentDate), month(payment.paymentDate)
            """)
    List<Object[]> getPaymentEvolutionByMonth();
}
