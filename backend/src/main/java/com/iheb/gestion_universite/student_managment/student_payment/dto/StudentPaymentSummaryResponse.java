package com.iheb.gestion_universite.student_managment.student_payment.dto;

import com.iheb.gestion_universite.student_managment.student_payment.AcademicPath;
import com.iheb.gestion_universite.student_managment.student_payment.PaymentPlan;
import com.iheb.gestion_universite.student_managment.student_payment.PaymentStatus;

import java.math.BigDecimal;

public record StudentPaymentSummaryResponse(
        Long studentId,
        String studentFullName,
        AcademicPath academicPath,
        PaymentPlan paymentPlan,
        boolean graduated,
        BigDecimal totalAmount,
        BigDecimal totalPaid,
        BigDecimal remainingAmount,
        PaymentStatus paymentStatus,
        boolean paymentAllowed,
        String blockingReason
) {
}
