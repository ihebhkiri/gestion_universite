package com.iheb.gestion_universite.announcement.dto;

import jakarta.validation.constraints.Size;

public record ArchiveAnnouncementRequest(
        @Size(max = 500, message = "Archive reason must not exceed 500 characters")
        String reason
) {
}
