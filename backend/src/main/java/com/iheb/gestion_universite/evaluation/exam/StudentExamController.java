package com.iheb.gestion_universite.evaluation.exam;

import com.iheb.gestion_universite.evaluation.exam.dto.ExamResponse;
import com.iheb.gestion_universite.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/students/me/exams")
public class StudentExamController {

    private final StudentExamService studentExamService;

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ExamResponse>> getMyExams(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(studentExamService.getMyExams(principal));
    }
}
