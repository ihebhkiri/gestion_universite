package com.iheb.gestion_universite.evaluation.result_management.dto;

import java.util.List;

public record StudentResultsResponse(
        StudentResultProfile student,
        List<StudentAcademicResult> results,
        List<StudentGradeUnit> gradeUnits,
        List<StudentRecentGrade> recentGrades
) {
}
