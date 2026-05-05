package com.iheb.gestion_universite.announcement.controller;

import com.iheb.gestion_universite.announcement.dto.StudentAnnouncementOverviewResponse;
import com.iheb.gestion_universite.announcement.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping({"/api/students", "/api/v1/students"})
public class StudentAnnouncementController {

    private final AnnouncementService announcementService;

    @GetMapping("/{studentId}/announcements")
    public ResponseEntity<StudentAnnouncementOverviewResponse> getStudentAnnouncements(@PathVariable Long studentId) {
        return ResponseEntity.ok(announcementService.getStudentAnnouncements(studentId));
    }
}
