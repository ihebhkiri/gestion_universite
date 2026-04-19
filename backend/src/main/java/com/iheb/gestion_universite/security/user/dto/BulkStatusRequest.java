package com.iheb.gestion_universite.security.user.dto;

import java.util.List;

public record BulkStatusRequest(
        List<Long> ids,
        Boolean enabled
) {
}
