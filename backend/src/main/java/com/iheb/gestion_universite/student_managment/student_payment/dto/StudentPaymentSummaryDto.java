package com.iheb.gestion_universite.student_managment.student_payment.dto;

import java.math.BigDecimal;

public record StudentPaymentSummaryDto(
        BigDecimal totalDue,
        BigDecimal totalPaid,
        BigDecimal totalRemaining,
        String currency,
        long paidCount,
        long pendingCount,
        long overdueCount
) {
}
