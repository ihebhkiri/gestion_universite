package com.iheb.gestion_universite.teaching.course;

import com.iheb.gestion_universite.security.UserPrincipal;
import com.iheb.gestion_universite.teaching.course.dto.StudentCourseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/students/me/courses")
public class StudentCourseController {

    private final StudentCourseService studentCourseService;

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Page<StudentCourseResponse>> getMyCourses(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String period,
            @RequestParam(required = false) Long teacherId,
            @RequestParam(required = false) Long subjectId,
            @PageableDefault(size = 10, sort = "publishedAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(studentCourseService.getMyCourses(principal, period, teacherId, subjectId, pageable));
    }
}
