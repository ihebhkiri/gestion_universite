package com.iheb.gestion_universite.announcement.dto;

import java.util.List;

public record StudentAnnouncementOverviewResponse(
        Long studentId,
        long unreadCount,
        long pinnedCount,
        List<AnnouncementResponse> announcements
) {
}
