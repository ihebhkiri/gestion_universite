package com.iheb.gestion_universite.student_managment.student_payment.dto;

import com.iheb.gestion_universite.student_managment.student_payment.PaymentMethod;

import java.math.BigDecimal;
import java.time.LocalDate;

public record StudentPaymentHistoryResponse(
        Long paymentId,
        String receiptNumber,
        LocalDate paymentDate,
        BigDecimal amount,
        BigDecimal previousRemainingAmount,
        BigDecimal newRemainingAmount,
        PaymentMethod paymentMethod
) {
}
