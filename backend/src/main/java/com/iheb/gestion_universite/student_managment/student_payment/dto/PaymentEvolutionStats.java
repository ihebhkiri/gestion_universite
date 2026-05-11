package com.iheb.gestion_universite.student_managment.student_payment.dto;

import java.math.BigDecimal;

public record PaymentEvolutionStats(
        String period,
        BigDecimal paidAmount
) {
}
