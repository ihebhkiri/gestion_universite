package com.iheb.gestion_universite.attendance.analytics.controller;

import com.iheb.gestion_universite.attendance.analytics.service.AttendanceAiReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/attendance-analytics/ai-report")
@PreAuthorize("hasRole('ADMIN')")
public class AttendanceAiReportController {

    private static final String PDF_FILENAME = "rapport-presence-ia.pdf";

    private final AttendanceAiReportService reportService;

    @GetMapping(value = "/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> generatePdfReport(
            @RequestParam(required = false) Long academicYearId,
            @RequestParam(required = false) Long semesterId,
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) Long groupId
    ) {
        byte[] pdf = reportService.generatePdfReport(academicYearId, semesterId, classId, groupId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(PDF_FILENAME).build().toString())
                .cacheControl(CacheControl.noStore())
                .body(pdf);
    }
}
