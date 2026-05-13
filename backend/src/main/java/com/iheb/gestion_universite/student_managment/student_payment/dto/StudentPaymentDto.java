package com.iheb.gestion_universite.student_managment.student_payment.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record StudentPaymentDto(
        Long id,
        String label,
        BigDecimal amountDue,
        BigDecimal amountPaid,
        BigDecimal remainingAmount,
        String currency,
        String status,
        LocalDate paidAt,
        String paymentMethod,
        String receiptNumber,
        boolean receiptAvailable
) {
}
