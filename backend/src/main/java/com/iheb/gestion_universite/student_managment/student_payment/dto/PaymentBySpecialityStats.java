package com.iheb.gestion_universite.student_managment.student_payment.dto;

import java.math.BigDecimal;

public record PaymentBySpecialityStats(
        String specialityName,
        BigDecimal paidAmount,
        BigDecimal remainingAmount,
        BigDecimal totalAmount
) {
}
