package com.iheb.gestion_universite.announcement.controller;

import com.iheb.gestion_universite.announcement.AnnouncementAudienceType;
import com.iheb.gestion_universite.announcement.AnnouncementPriority;
import com.iheb.gestion_universite.announcement.AnnouncementStatus;
import com.iheb.gestion_universite.announcement.AnnouncementType;
import com.iheb.gestion_universite.announcement.dto.AnnouncementDetailsResponse;
import com.iheb.gestion_universite.announcement.dto.AnnouncementResponse;
import com.iheb.gestion_universite.announcement.dto.AnnouncementStatsResponse;
import com.iheb.gestion_universite.announcement.dto.ArchiveAnnouncementRequest;
import com.iheb.gestion_universite.announcement.dto.CreateAnnouncementRequest;
import com.iheb.gestion_universite.announcement.dto.PublishAnnouncementRequest;
import com.iheb.gestion_universite.announcement.dto.UpdateAnnouncementRequest;
import com.iheb.gestion_universite.announcement.service.AnnouncementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping( "/api/v1/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @PostMapping
    public ResponseEntity<AnnouncementDetailsResponse> createAnnouncement(@Valid @RequestBody CreateAnnouncementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(announcementService.createAnnouncement(request));
    }
    @PostMapping(value = "/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AnnouncementDetailsResponse> uploadAttachments(
            @PathVariable Long id,
            @RequestParam("files") MultipartFile[] files
    ) {
        return ResponseEntity.ok(announcementService.uploadAttachments(id, files));
    }

    @GetMapping
    public ResponseEntity<List<AnnouncementResponse>> getAnnouncements(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) AnnouncementType type,
            @RequestParam(required = false) AnnouncementPriority priority,
            @RequestParam(required = false) AnnouncementStatus status,
            @RequestParam(required = false) AnnouncementAudienceType audienceType,
            @RequestParam(required = false) Boolean pinned
    ) {
        return ResponseEntity.ok(announcementService.getAnnouncements(search, type, priority, status, audienceType, pinned));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnnouncementDetailsResponse> getAnnouncement(@PathVariable Long id) {
        return ResponseEntity.ok(announcementService.getAnnouncement(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AnnouncementDetailsResponse> updateAnnouncement(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAnnouncementRequest request
    ) {
        return ResponseEntity.ok(announcementService.updateAnnouncement(id, request));
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<AnnouncementDetailsResponse> publishAnnouncement(
            @PathVariable Long id,
            @RequestBody(required = false) PublishAnnouncementRequest request
    ) {
        return ResponseEntity.ok(announcementService.publishAnnouncement(id, request));
    }

    @PostMapping("/{id}/schedule")
    public ResponseEntity<AnnouncementDetailsResponse> scheduleAnnouncement(
            @PathVariable Long id,
            @RequestBody(required = false) PublishAnnouncementRequest request
    ) {
        return ResponseEntity.ok(announcementService.scheduleAnnouncement(id, request));
    }

    @PostMapping("/{id}/archive")
    public ResponseEntity<AnnouncementDetailsResponse> archiveAnnouncement(
            @PathVariable Long id,
            @Valid @RequestBody(required = false) ArchiveAnnouncementRequest request
    ) {
        return ResponseEntity.ok(announcementService.archiveAnnouncement(id, request));
    }

    @PostMapping("/{id}/pin")
    public ResponseEntity<AnnouncementDetailsResponse> pinAnnouncement(@PathVariable Long id) {
        return ResponseEntity.ok(announcementService.pinAnnouncement(id));
    }

    @PostMapping("/{id}/unpin")
    public ResponseEntity<AnnouncementDetailsResponse> unpinAnnouncement(@PathVariable Long id) {
        return ResponseEntity.ok(announcementService.unpinAnnouncement(id));
    }


    @GetMapping("/stats")
    public ResponseEntity<AnnouncementStatsResponse> getStats() {
        return ResponseEntity.ok(announcementService.getStats());
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<AnnouncementDetailsResponse> markAsRead(
            @PathVariable Long id,
            @RequestParam Long studentId
    ) {
        return ResponseEntity.ok(announcementService.markAsRead(id, studentId));
    }
}
