package com.iheb.gestion_universite.student_managment.student_payment.dto;

public record StudentPaymentReceiptResult(
        byte[] content,
        String filename
) {
}
