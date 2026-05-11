package com.iheb.gestion_universite.student_managment.student_payment;

import com.iheb.gestion_universite.student_managment.student_payment.dto.PaymentStatisticsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/payments")
public class PaymentStatisticsController {

    private final PaymentStatisticsService paymentStatisticsService;

    @GetMapping("/statistics")
    public ResponseEntity<PaymentStatisticsResponse> getStatistics() {
        return ResponseEntity.ok(paymentStatisticsService.getStatistics());
    }
}
