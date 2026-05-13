package com.iheb.gestion_universite.evaluation.result_management.dto;

import java.util.List;

public record StudentGradeUnit(
        String unitName,
        String semester,
        Double coefficient,
        Double average,
        Integer capturedCredits,
        List<StudentGradeSubject> subjects
) {
}
