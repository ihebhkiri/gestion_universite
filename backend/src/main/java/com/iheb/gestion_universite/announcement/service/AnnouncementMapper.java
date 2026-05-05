package com.iheb.gestion_universite.announcement.service;

import com.iheb.gestion_universite.announcement.AnnouncementEntity;
import com.iheb.gestion_universite.announcement.dto.AnnouncementDetailsResponse;
import com.iheb.gestion_universite.announcement.dto.AnnouncementResponse;
import org.springframework.stereotype.Component;

@Component
public class AnnouncementMapper {

    public AnnouncementResponse toResponse(AnnouncementEntity announcement) {
        return new AnnouncementResponse(
                announcement.getId(),
                announcement.getTitle(),
                announcement.getContent(),
                announcement.getType(),
                announcement.getPriority(),
                announcement.getStatus(),
                announcement.getAudienceType(),
                announcement.getAudienceId(),
                announcement.isPinned(),
                announcement.getViewCount(),
                announcement.getScheduledAt(),
                announcement.getPublishedAt(),
                announcement.getExpiresAt(),
                announcement.getAttachmentUrl(),
                announcement.getExternalLink(),
                announcement.getCreatedAt()
        );
    }

    public AnnouncementDetailsResponse toDetailsResponse(AnnouncementEntity announcement) {
        return new AnnouncementDetailsResponse(
                announcement.getId(),
                announcement.getTitle(),
                announcement.getContent(),
                announcement.getType(),
                announcement.getPriority(),
                announcement.getStatus(),
                announcement.getAudienceType(),
                announcement.getAudienceId(),
                announcement.isPinned(),
                announcement.getViewCount(),
                announcement.getScheduledAt(),
                announcement.getPublishedAt(),
                announcement.getExpiresAt(),
                announcement.getArchivedAt(),
                announcement.getArchiveReason(),
                announcement.getAttachmentUrl(),
                announcement.getExternalLink(),
                announcement.getCreatedBy(),
                announcement.getCreatedAt(),
                announcement.getUpdatedAt()
        );
    }
}
