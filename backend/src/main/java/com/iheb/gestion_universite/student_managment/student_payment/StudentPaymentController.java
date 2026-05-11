package com.iheb.gestion_universite.student_managment.student_payment;

import com.iheb.gestion_universite.student_managment.student_payment.dto.StudentPaymentHistoryResponse;
import com.iheb.gestion_universite.student_managment.student_payment.dto.StudentPaymentReceiptResult;
import com.iheb.gestion_universite.student_managment.student_payment.dto.StudentPaymentSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/students/{studentId}/payments")
public class StudentPaymentController {

    private final StudentPaymentService studentPaymentService;

    @GetMapping("/summary")
    public ResponseEntity<StudentPaymentSummaryResponse> getSummary(@PathVariable Long studentId) {
        return ResponseEntity.ok(studentPaymentService.getSummary(studentId));
    }

    @GetMapping
    public ResponseEntity<List<StudentPaymentHistoryResponse>> getHistory(@PathVariable Long studentId) {
        return ResponseEntity.ok(studentPaymentService.getHistory(studentId));
    }

    @PostMapping("/monthly-600/receipt")
    public ResponseEntity<byte[]> registerMonthlyPaymentAndDownloadReceipt(@PathVariable Long studentId) {
        StudentPaymentReceiptResult receipt = studentPaymentService.registerMonthlyPayment(studentId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(receipt.filename()).build().toString()
                )
                .body(receipt.content());
    }
}
