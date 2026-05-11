package com.iheb.gestion_universite.student_managment.student_payment.dto;

import java.math.BigDecimal;

public record PaidVsRemainingStats(
        String label,
        BigDecimal paidAmount,
        BigDecimal remainingAmount
) {
}
