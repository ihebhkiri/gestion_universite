package com.iheb.gestion_universite.evaluation.result_management.dto;

import java.util.List;

public record ResultDetailsResponse(
        ResultSessionResponse session,
        List<ResultResponse> records,
        ResultStatsResponse stats
) {}
