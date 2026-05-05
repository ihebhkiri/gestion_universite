package com.iheb.gestion_universite.evaluation.result_management.dto;

public record PublishResultsRequest(
        Boolean notifyStudents,
        String message
) {}
