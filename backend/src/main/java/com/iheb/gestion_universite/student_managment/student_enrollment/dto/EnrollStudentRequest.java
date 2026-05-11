package com.iheb.gestion_universite.student_managment.student_enrollment.dto;

import com.iheb.gestion_universite.student_managment.student_payment.PaymentPlan;
import jakarta.validation.constraints.NotNull;

public record EnrollStudentRequest(
        @NotNull Long studentId,
        @NotNull PaymentPlan paymentPlan
) {

}
