package com.iheb.gestion_universite.announcement.service;

import com.iheb.gestion_universite.announcement.AnnouncementAudienceType;
import com.iheb.gestion_universite.announcement.AnnouncementEntity;
import com.iheb.gestion_universite.announcement.AnnouncementPriority;
import com.iheb.gestion_universite.announcement.AnnouncementReadReceiptEntity;
import com.iheb.gestion_universite.announcement.AnnouncementStatus;
import com.iheb.gestion_universite.announcement.AnnouncementType;
import com.iheb.gestion_universite.announcement.dto.AnnouncementDetailsResponse;
import com.iheb.gestion_universite.announcement.dto.AnnouncementResponse;
import com.iheb.gestion_universite.announcement.dto.AnnouncementStatsResponse;
import com.iheb.gestion_universite.announcement.dto.ArchiveAnnouncementRequest;
import com.iheb.gestion_universite.announcement.dto.CreateAnnouncementRequest;
import com.iheb.gestion_universite.announcement.dto.PublishAnnouncementRequest;
import com.iheb.gestion_universite.announcement.dto.StudentAnnouncementOverviewResponse;
import com.iheb.gestion_universite.announcement.dto.UpdateAnnouncementRequest;
import com.iheb.gestion_universite.announcement.repository.AnnouncementReadReceiptRepository;
import com.iheb.gestion_universite.announcement.repository.AnnouncementRepository;
import com.iheb.gestion_universite.core.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final AnnouncementReadReceiptRepository readReceiptRepository;
    private final AnnouncementMapper mapper;
    private final FileStorageService fileStorageService;

    @Transactional
    public AnnouncementDetailsResponse createAnnouncement(CreateAnnouncementRequest request) {
        AnnouncementEntity announcement = new AnnouncementEntity();
        announcement.setTitle(request.title());
        announcement.setContent(request.content());
        announcement.setType(request.type() != null ? request.type() : AnnouncementType.INFO);
        announcement.setPriority(request.priority() != null ? request.priority() : AnnouncementPriority.NORMAL);
        announcement.setAudienceType(AnnouncementAudienceType.ALL);
        announcement.setAudienceId(null);
        announcement.setScheduledAt(request.scheduledAt());
        announcement.setExpiresAt(request.expiresAt());
        announcement.setAttachmentUrl(request.attachmentUrl());
        announcement.setExternalLink(request.externalLink());
        announcement.setPinned(Boolean.TRUE.equals(request.pinned()));
        announcement.setCreatedBy(currentUsername());

        if (request.scheduledAt() != null && request.scheduledAt().isAfter(Instant.now())) {
            announcement.setStatus(AnnouncementStatus.SCHEDULED);
        }

        return mapper.toDetailsResponse(announcementRepository.save(announcement));
    }

    @Transactional(readOnly = true)
    public List<AnnouncementResponse> getAnnouncements(
            String search,
            AnnouncementType type,
            AnnouncementPriority priority,
            AnnouncementStatus status,
            AnnouncementAudienceType audienceType,
            Boolean pinned
    ) {
        String normalizedSearch = search == null ? "" : search.trim().toLowerCase(Locale.ROOT);
        return announcementRepository.findAll()
                .stream()
                .filter(announcement -> status != null
                        ? announcement.getStatus() == status
                        : announcement.getStatus() != AnnouncementStatus.ARCHIVED)
                .filter(announcement -> type == null || announcement.getType() == type)
                .filter(announcement -> priority == null || announcement.getPriority() == priority)
                .filter(announcement -> audienceType == null || announcement.getAudienceType() == audienceType)
                .filter(announcement -> pinned == null || announcement.isPinned() == pinned)
                .filter(announcement -> normalizedSearch.isBlank() || containsSearchText(announcement, normalizedSearch))
                .sorted(Comparator
                        .comparing(AnnouncementEntity::isPinned).reversed()
                        .thenComparing(this::announcementSortDate, Comparator.reverseOrder()))
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional
    public AnnouncementDetailsResponse getAnnouncement(Long id) {
        AnnouncementEntity announcement = getAnnouncementOrThrow(id);
        announcement.setViewCount(announcement.getViewCount() + 1);
        return mapper.toDetailsResponse(announcement);
    }

    @Transactional
    public AnnouncementDetailsResponse updateAnnouncement(Long id, UpdateAnnouncementRequest request) {
        AnnouncementEntity announcement = getAnnouncementOrThrow(id);
        requireDraft(announcement);

        if (request.title() != null) {
            announcement.setTitle(request.title());
        }
        if (request.content() != null) {
            announcement.setContent(request.content());
        }
        if (request.type() != null) {
            announcement.setType(request.type());
        }
        if (request.priority() != null) {
            announcement.setPriority(request.priority());
        }
        announcement.setAudienceType(AnnouncementAudienceType.ALL);
        announcement.setAudienceId(null);
        if (request.scheduledAt() != null) {
            announcement.setScheduledAt(request.scheduledAt());
            if (request.scheduledAt().isAfter(Instant.now())) {
                announcement.setStatus(AnnouncementStatus.SCHEDULED);
            }
        }
        if (request.expiresAt() != null) {
            announcement.setExpiresAt(request.expiresAt());
        }
        if (request.attachmentUrl() != null) {
            announcement.setAttachmentUrl(request.attachmentUrl());
        }
        if (request.externalLink() != null) {
            announcement.setExternalLink(request.externalLink());
        }
        if (request.pinned() != null) {
            announcement.setPinned(request.pinned());
        }

        return mapper.toDetailsResponse(announcement);
    }

    @Transactional
    public AnnouncementDetailsResponse publishAnnouncement(Long id, PublishAnnouncementRequest request) {
        AnnouncementEntity announcement = getAnnouncementOrThrow(id);
        Instant now = Instant.now();
        announcement.setStatus(AnnouncementStatus.PUBLISHED);
        announcement.setPublishedAt(now);
        announcement.setScheduledAt(request != null ? request.scheduledAt() : announcement.getScheduledAt());
        return mapper.toDetailsResponse(announcement);
    }

    @Transactional
    public AnnouncementDetailsResponse scheduleAnnouncement(Long id, PublishAnnouncementRequest request) {
        AnnouncementEntity announcement = getAnnouncementOrThrow(id);
        Instant scheduledAt = request != null ? request.scheduledAt() : null;
        if (scheduledAt == null || !scheduledAt.isAfter(Instant.now())) {
            throw new IllegalArgumentException("scheduledAt must be in the future");
        }
        announcement.setStatus(AnnouncementStatus.SCHEDULED);
        announcement.setScheduledAt(scheduledAt);
        announcement.setPublishedAt(null);
        return mapper.toDetailsResponse(announcement);
    }

    @Transactional
    public AnnouncementDetailsResponse archiveAnnouncement(Long id, ArchiveAnnouncementRequest request) {
        AnnouncementEntity announcement = getAnnouncementOrThrow(id);
        announcement.setStatus(AnnouncementStatus.ARCHIVED);
        announcement.setArchivedAt(Instant.now());
        announcement.setArchiveReason(request != null ? request.reason() : null);
        announcement.setPinned(false);
        return mapper.toDetailsResponse(announcement);
    }

    @Transactional
    public AnnouncementDetailsResponse pinAnnouncement(Long id) {
        AnnouncementEntity announcement = getAnnouncementOrThrow(id);
        if (announcement.getStatus() == AnnouncementStatus.ARCHIVED) {
            throw new IllegalArgumentException("Archived announcements cannot be pinned");
        }
        announcement.setPinned(true);
        return mapper.toDetailsResponse(announcement);
    }

    @Transactional
    public AnnouncementDetailsResponse unpinAnnouncement(Long id) {
        AnnouncementEntity announcement = getAnnouncementOrThrow(id);
        announcement.setPinned(false);
        return mapper.toDetailsResponse(announcement);
    }

    @Transactional
    public AnnouncementDetailsResponse uploadAttachments(Long id, MultipartFile[] files) {
        AnnouncementEntity announcement = getAnnouncementOrThrow(id);
        List<String> urls = fileStorageService.storeAll(files, "gestion-universitaire/announcements/" + id);
        if (urls.isEmpty()) {
            return mapper.toDetailsResponse(announcement);
        }

        List<String> allAttachments = new ArrayList<>(splitAttachments(announcement.getAttachmentUrl()));
        allAttachments.addAll(urls);
        announcement.setAttachmentUrl(String.join(",", allAttachments));
        return mapper.toDetailsResponse(announcement);
    }

    @Transactional(readOnly = true)
    public AnnouncementStatsResponse getStats() {
        Instant now = Instant.now();
        Instant soon = now.plus(7, ChronoUnit.DAYS);
        return new AnnouncementStatsResponse(
                announcementRepository.countByStatus(AnnouncementStatus.PUBLISHED),
                announcementRepository.countByStatus(AnnouncementStatus.SCHEDULED),
                announcementRepository.countByPriority(AnnouncementPriority.CRITICAL) + announcementRepository.countByPriority(AnnouncementPriority.HIGH),
                announcementRepository.countByStatus(AnnouncementStatus.ARCHIVED),
                announcementRepository.sumViewCount(),
                announcementRepository.findFirstByStatusAndScheduledAtAfterOrderByScheduledAtAsc(AnnouncementStatus.SCHEDULED, now)
                        .map(AnnouncementEntity::getScheduledAt)
                        .orElse(null),
                announcementRepository.countByStatusNotAndExpiresAtBetween(AnnouncementStatus.ARCHIVED, now, soon)
        );
    }

    @Transactional(readOnly = true)
    public StudentAnnouncementOverviewResponse getStudentAnnouncements(Long studentId) {
        List<AnnouncementEntity> announcements = announcementRepository.findVisibleForStudent(studentId, Instant.now());
        Set<Long> readAnnouncementIds = readReceiptRepository.findByStudentId(studentId)
                .stream()
                .map(receipt -> receipt.getAnnouncement().getId())
                .collect(Collectors.toSet());
        long unreadCount = announcements.stream()
                .filter(announcement -> !readAnnouncementIds.contains(announcement.getId()))
                .count();
        long pinnedCount = announcements.stream()
                .filter(AnnouncementEntity::isPinned)
                .count();

        return new StudentAnnouncementOverviewResponse(
                studentId,
                unreadCount,
                pinnedCount,
                announcements.stream().map(mapper::toResponse).toList()
        );
    }

    @Transactional
    public AnnouncementDetailsResponse markAsRead(Long id, Long studentId) {
        if (studentId == null) {
            throw new IllegalArgumentException("studentId is required");
        }
        AnnouncementEntity announcement = getAnnouncementOrThrow(id);
        readReceiptRepository.findByAnnouncementIdAndStudentId(id, studentId)
                .orElseGet(() -> {
                    AnnouncementReadReceiptEntity receipt = new AnnouncementReadReceiptEntity();
                    receipt.setAnnouncement(announcement);
                    receipt.setStudentId(studentId);
                    receipt.setReadAt(Instant.now());
                    return readReceiptRepository.save(receipt);
                });
        return mapper.toDetailsResponse(announcement);
    }

    private AnnouncementEntity getAnnouncementOrThrow(Long id) {
        return announcementRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Announcement not found with id: " + id));
    }

    private boolean containsSearchText(AnnouncementEntity announcement, String search) {
        return contains(announcement.getTitle(), search)
                || contains(announcement.getContent(), search)
                || contains(announcement.getCreatedBy(), search);
    }

    private boolean contains(String value, String search) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(search);
    }

    private List<String> splitAttachments(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }
        return List.of(value.split(","))
                .stream()
                .map(String::trim)
                .filter(item -> !item.isBlank())
                .toList();
    }

    private Instant announcementSortDate(AnnouncementEntity announcement) {
        if (announcement.getPublishedAt() != null) {
            return announcement.getPublishedAt();
        }
        if (announcement.getScheduledAt() != null) {
            return announcement.getScheduledAt();
        }
        if (announcement.getCreatedAt() != null) {
            return announcement.getCreatedAt();
        }
        return Instant.EPOCH;
    }

    private void requireDraft(AnnouncementEntity announcement) {
        if (announcement.getStatus() != AnnouncementStatus.DRAFT) {
            throw new IllegalArgumentException("Only draft announcements can be updated");
        }
    }

    private String currentUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            return null;
        }
        return authentication.getName();
    }
}
