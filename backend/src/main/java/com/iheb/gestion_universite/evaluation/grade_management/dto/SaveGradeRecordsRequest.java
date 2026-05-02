package com.iheb.gestion_universite.evaluation.grade_management.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record SaveGradeRecordsRequest(
        @NotEmpty(message = "At least one grade record is required")
        List<@Valid SaveGradeRecordItemRequest> records
) {}
