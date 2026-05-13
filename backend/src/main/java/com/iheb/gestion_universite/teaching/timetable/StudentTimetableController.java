package com.iheb.gestion_universite.teaching.timetable;

import com.iheb.gestion_universite.security.UserPrincipal;
import com.iheb.gestion_universite.teaching.timetable.dto.TimetableResponse;
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
@RequestMapping("/api/v1/students/me/timetable")
public class StudentTimetableController {

    private final StudentTimetableService studentTimetableService;

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<TimetableResponse>> getTimetable(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(studentTimetableService.getTimetable(principal));
    }

    @GetMapping("/today")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<TimetableResponse>> getTodayAgenda(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(studentTimetableService.getTodayAgenda(principal));
    }
}
