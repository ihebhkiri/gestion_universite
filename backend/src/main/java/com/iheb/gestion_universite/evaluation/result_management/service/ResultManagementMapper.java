package com.iheb.gestion_universite.evaluation.result_management.service;

import com.iheb.gestion_universite.academic.academic_class.AcademicClassEntity;
import com.iheb.gestion_universite.academic.academic_year.AcademicYearEntity;
import com.iheb.gestion_universite.academic.semester.SemesterEntity;
import com.iheb.gestion_universite.evaluation.exam.ExamEntity;
import com.iheb.gestion_universite.evaluation.grade.entities.GradeEntity;
import com.iheb.gestion_universite.evaluation.result_management.dto.ResultResponse;
import com.iheb.gestion_universite.evaluation.result_management.dto.ResultSessionResponse;
import com.iheb.gestion_universite.evaluation.result_management.dto.ResultStatsResponse;
import com.iheb.gestion_universite.evaluation.result_management.dto.StudentResultOverviewResponse;
import com.iheb.gestion_universite.evaluation.result_management.entity.ResultSessionEntity;
import com.iheb.gestion_universite.evaluation.result_management.entity.ResultStatus;
import com.iheb.gestion_universite.student_managment.student.StudentEntity;
import com.iheb.gestion_universite.student_managment.student_group.StudentGroupEntity;
import com.iheb.gestion_universite.teaching.course.CourseEntity;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Objects;

@Component
public class ResultManagementMapper {

    public ResultSessionResponse toSessionResponse(ResultSessionEntity session, long totalRecords) {
        ExamEntity exam = session.getExam();
        CourseEntity course = exam != null ? exam.getCourse() : null;
        AcademicClassEntity academicClass = exam != null ? exam.getAcademicClass() : null;
        StudentGroupEntity group = exam != null ? exam.getStudentGroup() : null;
        SemesterEntity semester = exam != null ? exam.getSemester() : null;
        AcademicYearEntity academicYear = semester != null
                ? semester.getAcademicYear()
                : academicClass != null ? academicClass.getAcademicYear() : null;

        return new ResultSessionResponse(
                session.getId(),
                exam != null ? exam.getId() : null,
                exam != null ? exam.getTitle() : null,
                exam != null ? exam.getType() : null,
                exam != null ? exam.getSessionType() : null,
                exam != null ? exam.getExamDate() : null,
                course != null ? course.getId() : null,
                course != null ? course.getCode() : null,
                course != null ? course.getTitle() : null,
                academicClass != null ? academicClass.getId() : null,
                academicClass != null ? academicClass.getCode() : null,
                group != null ? group.getId() : null,
                group != null ? group.getName() : null,
                semester != null ? semester.getId() : null,
                semester != null ? semester.getName() : null,
                academicYear != null ? academicYear.getId() : null,
                academicYear != null ? academicYear.getLabel() : null,
                session.getStatus(),
                totalRecords,
                session.getCreatedAt(),
                session.getUpdatedAt(),
                session.getValidatedAt(),
                session.getPublishedAt()
        );
    }

    public ResultResponse toResultResponse(GradeEntity record, Long sessionId) {
        StudentEntity student = record.getStudent();
        ExamEntity exam = record.getExam();
        return new ResultResponse(
                record.getId(),
                sessionId,
                exam != null ? exam.getId() : null,
                student != null ? student.getId() : null,
                student != null ? student.getMatricule() : null,
                studentName(student),
                record.getScore(),
                record.getMaxScore(),
                record.getWeightedScore(),
                record.getMention(),
                record.getResultStatus() != null ? record.getResultStatus() : ResultStatus.PENDING,
                record.getPublished(),
                record.getComment(),
                record.getGradedAt(),
                record.getUpdatedAt()
        );
    }

    public ResultStatsResponse toStats(List<GradeEntity> records) {
        long total = records.size();
        long passed = countByStatus(records, ResultStatus.PASSED);
        long failed = countByStatus(records, ResultStatus.FAILED);
        long absent = countByStatus(records, ResultStatus.ABSENT);
        long pending = countByStatus(records, ResultStatus.PENDING);
        long evaluated = passed + failed;

        List<GradeEntity> scored = records.stream()
                .filter(record -> record.getScore() != null)
                .toList();

        Double average = scored.isEmpty()
                ? null
                : round(scored.stream().mapToDouble(GradeEntity::getScore).average().orElse(0));
        Double best = scored.isEmpty()
                ? null
                : round(scored.stream().mapToDouble(GradeEntity::getScore).max().orElse(0));
        Double successRate = evaluated == 0 ? 0 : round((passed * 100.0) / evaluated);

        return new ResultStatsResponse(total, evaluated, passed, failed, absent, pending, average, best, successRate);
    }

    public StudentResultOverviewResponse toStudentOverview(StudentEntity student, List<GradeEntity> records) {
        List<ResultResponse> results = records.stream()
                .map(record -> toResultResponse(record, null))
                .toList();
        ResultStatsResponse stats = toStats(records);

        return new StudentResultOverviewResponse(
                student != null ? student.getId() : null,
                student != null ? student.getMatricule() : null,
                studentName(student),
                records.size(),
                stats.passedCount(),
                stats.failedCount(),
                stats.averageScore(),
                results
        );
    }

    private long countByStatus(List<GradeEntity> records, ResultStatus status) {
        return records.stream()
                .filter(record -> (record.getResultStatus() != null ? record.getResultStatus() : ResultStatus.PENDING) == status)
                .count();
    }

    private String studentName(StudentEntity student) {
        if (student == null) return null;
        return (Objects.toString(student.getFirstName(), "") + " " + Objects.toString(student.getLastName(), "")).trim();
    }

    private Double round(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
