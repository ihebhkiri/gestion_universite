package com.iheb.gestion_universite.student_managment.student_payment.dto;

import java.util.List;

public record PaymentStatisticsResponse(
        PaymentSummaryStats summary,
        List<PaidVsRemainingStats> paidVsRemaining,
        List<PaymentBySpecialityStats> paymentsBySpeciality,
        List<PaymentEvolutionStats> paymentEvolution
) {
}
