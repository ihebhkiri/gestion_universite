package com.iheb.gestion_universite.announcement.dto;

import com.iheb.gestion_universite.announcement.AnnouncementAudienceType;
import com.iheb.gestion_universite.announcement.AnnouncementPriority;
import com.iheb.gestion_universite.announcement.AnnouncementStatus;
import com.iheb.gestion_universite.announcement.AnnouncementType;

import java.time.Instant;

public record AnnouncementDetailsResponse(
        Long id,
        String title,
        String content,
        AnnouncementType type,
        AnnouncementPriority priority,
        AnnouncementStatus status,
        AnnouncementAudienceType audienceType,
        Long audienceId,
        boolean pinned,
        long viewCount,
        Instant scheduledAt,
        Instant publishedAt,
        Instant expiresAt,
        Instant archivedAt,
        String archiveReason,
        String attachmentUrl,
        String externalLink,
        String createdBy,
        Instant createdAt,
        Instant updatedAt
) {
}
