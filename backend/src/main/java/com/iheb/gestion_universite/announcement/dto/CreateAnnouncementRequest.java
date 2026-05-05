package com.iheb.gestion_universite.announcement.dto;

import com.iheb.gestion_universite.announcement.AnnouncementAudienceType;
import com.iheb.gestion_universite.announcement.AnnouncementPriority;
import com.iheb.gestion_universite.announcement.AnnouncementType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record CreateAnnouncementRequest(
        @NotBlank(message = "Title is required")
        @Size(max = 160, message = "Title must not exceed 160 characters")
        String title,

        @NotBlank(message = "Content is required")
        @Size(max = 4000, message = "Content must not exceed 4000 characters")
        String content,

        AnnouncementType type,
        AnnouncementPriority priority,
        AnnouncementAudienceType audienceType,
        Long audienceId,
        Instant scheduledAt,
        Instant expiresAt,
        @Size(max = 4000, message = "Attachment value must not exceed 4000 characters")
        String attachmentUrl,
        @Size(max = 700, message = "External link must not exceed 700 characters")
        String externalLink,
        Boolean pinned
) {
}
