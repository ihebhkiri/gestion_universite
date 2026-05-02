package com.iheb.gestion_universite.evaluation.grade_management.service;

import com.iheb.gestion_universite.academic.academic_class.AcademicClassEntity;
import com.iheb.gestion_universite.academic.semester.SemesterEntity;
import com.iheb.gestion_universite.evaluation.exam.ExamEntity;
import com.iheb.gestion_universite.evaluation.grade.entities.GradeEntity;
import com.iheb.gestion_universite.evaluation.grade.entities.GradeStatus;
import com.iheb.gestion_universite.evaluation.grade_management.dto.GradeDistributionBucketResponse;
import com.iheb.gestion_universite.evaluation.grade_management.dto.GradeRecordResponse;
import com.iheb.gestion_universite.evaluation.grade_management.dto.GradeStatsResponse;
import com.iheb.gestion_universite.evaluation.grade_management.dto.GradebookExamResponse;
import com.iheb.gestion_universite.student_managment.student.StudentEntity;
import com.iheb.gestion_universite.student_managment.student_enrollment.EnrollmentStatus;
import com.iheb.gestion_universite.student_managment.student_enrollment.StudentEnrollmentEntity;
import com.iheb.gestion_universite.student_managment.student_group.StudentGroupEntity;
import com.iheb.gestion_universite.teaching.course.CourseEntity;
import com.iheb.gestion_universite.teaching.teacher.TeacherEntity;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Objects;

@Component
public class GradeManagementMapper {

    private static final double DEFAULT_MAX_SCORE = 20.0;

    public GradebookExamResponse toExamResponse(ExamEntity exam) {
        CourseEntity course = exam.getCourse();
        AcademicClassEntity academicClass = exam.getAcademicClass();
        StudentGroupEntity group = exam.getStudentGroup();
        TeacherEntity supervisor = exam.getSupervisor();
        SemesterEntity semester = exam.getSemester();

        return new GradebookExamResponse(
                exam.getId(),
                exam.getTitle(),
                exam.getType(),
                exam.getSessionType(),
                exam.getStatus(),
                exam.getDuration(),
                exam.getWeight(),
                maxScore(exam),
                exam.getExamDate(),
                exam.getStartTime(),
                exam.getEndTime(),
                exam.getInstructions(),
                course != null ? course.getId() : null,
                course != null ? course.getCode() : null,
                course != null ? course.getTitle() : null,
                academicClass != null ? academicClass.getId() : null,
                academicClass != null ? academicClass.getCode() : null,
                group != null ? group.getId() : null,
                group != null ? group.getName() : null,
                supervisor != null ? supervisor.getId() : null,
                teacherName(supervisor),
                semester != null ? semester.getId() : null,
                semester != null ? semester.getName() : null,
                exam.getCreatedAt()
        );
    }

    public GradeRecordResponse toRecordResponse(GradeEntity record) {
        StudentEntity student = record.getStudent();
        return new GradeRecordResponse(
                record.getId(),
                student != null ? student.getId() : null,
                student != null ? student.getMatricule() : null,
                studentName(student),
                groupName(student),
                record.getScore(),
                record.getMaxScore(),
                record.getComment(),
                record.getStatus(),
                record.getGradedAt(),
                record.getUpdatedAt()
        );
    }

    public GradeStatsResponse toStats(ExamEntity exam, List<GradeEntity> records) {
        long total = records.size();
        List<GradeEntity> graded = records.stream()
                .filter(record -> record.getScore() != null)
                .toList();
        long gradedCount = graded.size();
        double maxScore = maxScore(exam);
        double passThreshold = maxScore / 2.0;

        Double average = graded.isEmpty()
                ? null
                : round(graded.stream().mapToDouble(GradeEntity::getScore).average().orElse(0));
        Double highest = graded.isEmpty()
                ? null
                : round(graded.stream().mapToDouble(GradeEntity::getScore).max().orElse(0));
        Double lowest = graded.isEmpty()
                ? null
                : round(graded.stream().mapToDouble(GradeEntity::getScore).min().orElse(0));

        long passCount = graded.stream().filter(record -> record.getScore() >= passThreshold).count();
        long failCount = gradedCount - passCount;

        return new GradeStatsResponse(
                total,
                gradedCount,
                total - gradedCount,
                countByStatus(records, GradeStatus.DRAFT),
                countByStatus(records, GradeStatus.VALIDATED),
                countByStatus(records, GradeStatus.PUBLISHED),
                passCount,
                failCount,
                total == 0 ? 0 : round((gradedCount * 100.0) / total),
                gradedCount == 0 ? 0 : round((passCount * 100.0) / gradedCount),
                average,
                highest,
                lowest,
                maxScore,
                passThreshold,
                distribution(graded, maxScore)
        );
    }

    private List<GradeDistributionBucketResponse> distribution(List<GradeEntity> graded, double maxScore) {
        double step = maxScore / 4.0;
        return List.of(
                bucket("Low", 0, step, graded, true),
                bucket("Basic", step, step * 2, graded, false),
                bucket("Good", step * 2, step * 3, graded, false),
                bucket("Excellent", step * 3, maxScore, graded, false)
        );
    }

    private GradeDistributionBucketResponse bucket(String label, double min, double max, List<GradeEntity> records, boolean includeMin) {
        long count = records.stream()
                .filter(record -> includeMin ? record.getScore() >= min : record.getScore() > min)
                .filter(record -> record.getScore() <= max)
                .count();
        return new GradeDistributionBucketResponse(label, round(min), round(max), count);
    }

    private long countByStatus(List<GradeEntity> records, GradeStatus status) {
        return records.stream()
                .filter(record -> record.getStatus() == status)
                .count();
    }

    private double maxScore(ExamEntity exam) {
        return exam.getMaxScore() != null ? exam.getMaxScore() : DEFAULT_MAX_SCORE;
    }

    private String teacherName(TeacherEntity teacher) {
        if (teacher == null) return null;
        return (Objects.toString(teacher.getFirstName(), "") + " " + Objects.toString(teacher.getLastName(), "")).trim();
    }

    private String studentName(StudentEntity student) {
        if (student == null) return null;
        return (Objects.toString(student.getFirstName(), "") + " " + Objects.toString(student.getLastName(), "")).trim();
    }

    private String groupName(StudentEntity student) {
        if (student == null || student.getEnrollments() == null) return null;
        return student.getEnrollments().stream()
                .filter(enrollment -> enrollment.getStatus() == EnrollmentStatus.CONFIRMED)
                .map(StudentEnrollmentEntity::getGroup)
                .filter(Objects::nonNull)
                .map(StudentGroupEntity::getName)
                .findFirst()
                .orElse(null);
    }

    private double round(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
