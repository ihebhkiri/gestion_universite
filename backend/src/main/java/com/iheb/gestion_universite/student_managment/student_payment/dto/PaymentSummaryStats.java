package com.iheb.gestion_universite.student_managment.student_payment.dto;

import java.math.BigDecimal;

public record PaymentSummaryStats(
        BigDecimal totalAmount,
        BigDecimal totalPaidAmount,
        BigDecimal totalRemainingAmount,
        BigDecimal paidPercentage,
        BigDecimal remainingPercentage,
        String currency
) {
}
