package com.iheb.gestion_universite.student_managment.student_payment;

import com.iheb.gestion_universite.security.UserPrincipal;
import com.iheb.gestion_universite.student_managment.student_payment.dto.StudentPaymentDto;
import com.iheb.gestion_universite.student_managment.student_payment.dto.StudentPaymentSummaryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/students/me/payments")
@PreAuthorize("hasRole('STUDENT')")
public class StudentMyPaymentController {

    private final StudentPaymentService studentPaymentService;

    @GetMapping
    public ResponseEntity<Page<StudentPaymentDto>> getMyPayments(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @PageableDefault(size = 10, sort = "paymentDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(studentPaymentService.getMyPayments(principal, status, fromDate, toDate, pageable));
    }

    @GetMapping("/summary")
    public ResponseEntity<StudentPaymentSummaryDto> getMyPaymentSummary(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(studentPaymentService.getMySummary(principal));
    }
}
