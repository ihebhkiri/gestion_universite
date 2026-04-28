package com.iheb.gestion_universite.teaching.subject.dto;


import jakarta.validation.constraints.NotBlank;

public record AddSubjectRequest(
        @NotBlank(message = "Subject name is required")
        String subjectName
                              ) {

}
