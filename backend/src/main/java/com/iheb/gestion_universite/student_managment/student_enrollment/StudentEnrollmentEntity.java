package com.iheb.gestion_universite.student_managment.student_enrollment;


import com.iheb.gestion_universite.core.base_entity.BaseEntity;
import com.iheb.gestion_universite.student_managment.student.StudentEntity;
import com.iheb.gestion_universite.student_managment.student_group.StudentGroupEntity;
import com.iheb.gestion_universite.student_managment.student_payment.PaymentPlan;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "enrollments")
public class StudentEnrollmentEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id")
    private StudentEntity student;

    @ManyToOne
    @JoinColumn(name = "student_group_id")
    private StudentGroupEntity group;

    @Enumerated(EnumType.STRING)
    private EnrollmentStatus status = EnrollmentStatus.CONFIRMED ;

    @Enumerated(EnumType.STRING)
    private PaymentPlan paymentPlan;

    private LocalDate enrollmentDate;

}
