package com.iheb.gestion_universite.student_managment.student_payment;

import com.iheb.gestion_universite.core.base_entity.BaseEntity;
import com.iheb.gestion_universite.student_managment.student.StudentEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "student_payments")
public class StudentPaymentEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private StudentEntity student;

    @ManyToOne
    @JoinColumn(name = "payment_account_id", nullable = false)
    private StudentPaymentAccountEntity paymentAccount;

    @Column(nullable = false, unique = true)
    private String receiptNumber;

    @Column(nullable = false)
    private LocalDate paymentDate;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal previousRemainingAmount;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal newRemainingAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;
}
