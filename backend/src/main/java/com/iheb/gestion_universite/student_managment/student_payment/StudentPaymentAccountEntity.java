package com.iheb.gestion_universite.student_managment.student_payment;

import com.iheb.gestion_universite.core.base_entity.BaseEntity;
import com.iheb.gestion_universite.student_managment.student.StudentEntity;
import com.iheb.gestion_universite.student_managment.student_enrollment.StudentEnrollmentEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@Table(name = "student_payment_accounts")
public class StudentPaymentAccountEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "student_id", nullable = false, unique = true)
    private StudentEntity student;

    @ManyToOne
    @JoinColumn(name = "enrollment_id", nullable = false)
    private StudentEnrollmentEntity enrollment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AcademicPath academicPath;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentPlan paymentPlan;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPaid;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal remainingAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus paymentStatus;
}
