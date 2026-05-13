package com.iheb.gestion_universite.evaluation.result_management.service;

import com.iheb.gestion_universite.academic.academic_class.AcademicClassEntity;
import com.iheb.gestion_universite.academic.academic_year.AcademicYearEntity;
import com.iheb.gestion_universite.academic.semester.SemesterEntity;
import com.iheb.gestion_universite.core.exceptions.StudentNotFoundException;
import com.iheb.gestion_universite.evaluation.exam.ExamEntity;
import com.iheb.gestion_universite.evaluation.exam.ExamType;
import com.iheb.gestion_universite.evaluation.exam.SessionType;
import com.iheb.gestion_universite.evaluation.grade.entities.GradeEntity;
import com.iheb.gestion_universite.evaluation.grade.repositories.GradesRepo;
import com.iheb.gestion_universite.evaluation.result_management.dto.StudentAcademicResult;
import com.iheb.gestion_universite.evaluation.result_management.dto.StudentGradeSubject;
import com.iheb.gestion_universite.evaluation.result_management.dto.StudentGradeUnit;
import com.iheb.gestion_universite.evaluation.result_management.dto.StudentRecentGrade;
import com.iheb.gestion_universite.evaluation.result_management.dto.StudentResultProfile;
import com.iheb.gestion_universite.evaluation.result_management.dto.StudentResultsResponse;
import com.iheb.gestion_universite.evaluation.result_management.entity.ResultStatus;
import com.iheb.gestion_universite.security.UserPrincipal;
import com.iheb.gestion_universite.student_managment.student.StudentEntity;
import com.iheb.gestion_universite.student_managment.student.StudentRepository;
import com.iheb.gestion_universite.student_managment.student_enrollment.StudentEnrollmentEntity;
import com.iheb.gestion_universite.teaching.course.CourseEntity;
import com.iheb.gestion_universite.teaching.subject.SubjectEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentResultService {

    private static final double DEFAULT_MAX_SCORE = 20.0;

    private final StudentRepository studentRepository;
    private final GradesRepo gradesRepo;

    public StudentResultsResponse getMyResults(UserPrincipal principal) {
        StudentEntity student = resolveStudent(principal);
        List<GradeEntity> records = gradesRepo.findPublishedResultsByStudentId(student.getId());

        return new StudentResultsResponse(
                toProfile(student, records),
                toAcademicResults(records),
                toGradeUnits(records),
                toRecentGrades(records)
        );
    }

    private StudentEntity resolveStudent(UserPrincipal principal) {
        if (principal == null || isBlank(principal.getUsername())) {
            throw new StudentNotFoundException("Student profile not found");
        }

        return studentRepository.findByUser_EmailIgnoreCase(principal.getUsername())
                .orElseThrow(() -> new StudentNotFoundException("Student profile not found"));
    }

    private StudentResultProfile toProfile(StudentEntity student, List<GradeEntity> records) {
        StudentEnrollmentEntity enrollment = latestEnrollment(student);
        AcademicClassEntity academicClass = enrollment != null && enrollment.getGroup() != null
                ? enrollment.getGroup().getAcademicClass()
                : firstAcademicClass(records);
        AcademicYearEntity academicYear = academicClass != null ? academicClass.getAcademicYear() : firstAcademicYear(records);

        return new StudentResultProfile(
                student.getId(),
                fullName(student),
                academicClass != null ? academicClass.getCode() : null,
                academicYear != null ? academicYear.getLabel() : null
        );
    }

    private List<StudentAcademicResult> toAcademicResults(List<GradeEntity> records) {
        Map<String, List<GradeEntity>> groups = new LinkedHashMap<>();

        sortedBySession(records).forEach(record -> {
            ExamEntity exam = record.getExam();
            String key = sessionLabel(exam) + "|" + periodLabel(exam);
            groups.computeIfAbsent(key, ignored -> new ArrayList<>()).add(record);
        });

        return groups.values()
                .stream()
                .map(group -> {
                    ExamEntity exam = group.get(0).getExam();
                    Double average = average(group);
                    return new StudentAcademicResult(
                            sessionLabel(exam),
                            periodLabel(exam),
                            average,
                            null,
                            average == null ? null : average >= 10 ? "Admis" : "Ajourné",
                            average == null ? null : mentionFor(average),
                            null,
                            null
                    );
                })
                .toList();
    }

    private List<StudentGradeUnit> toGradeUnits(List<GradeEntity> records) {
        Map<String, List<GradeEntity>> units = new LinkedHashMap<>();

        sortedBySubject(records).forEach(record -> {
            String key = unitName(record) + "|" + semesterName(record.getExam());
            units.computeIfAbsent(key, ignored -> new ArrayList<>()).add(record);
        });

        return units.values()
                .stream()
                .map(unitRecords -> {
                    String unitName = unitName(unitRecords.get(0));
                    String semester = semesterName(unitRecords.get(0).getExam());
                    List<StudentGradeSubject> subjects = toSubjects(unitRecords);
                    return new StudentGradeUnit(
                            unitName,
                            semester,
                            round(subjects.stream()
                                    .map(StudentGradeSubject::coefficient)
                                    .filter(Objects::nonNull)
                                    .mapToDouble(Double::doubleValue)
                                    .sum()),
                            weightedAverage(subjects),
                            null,
                            subjects
                    );
                })
                .toList();
    }

    private List<StudentGradeSubject> toSubjects(List<GradeEntity> unitRecords) {
        Map<Long, List<GradeEntity>> courses = new LinkedHashMap<>();

        unitRecords.forEach(record -> {
            CourseEntity course = record.getExam() != null ? record.getExam().getCourse() : null;
            Long courseId = course != null && course.getId() != null ? course.getId() : record.getId();
            courses.computeIfAbsent(courseId, ignored -> new ArrayList<>()).add(record);
        });

        return courses.values()
                .stream()
                .map(courseRecords -> {
                    CourseEntity course = courseRecords.get(0).getExam() != null ? courseRecords.get(0).getExam().getCourse() : null;
                    return new StudentGradeSubject(
                            course != null ? course.getTitle() : "Matiere",
                            course != null ? course.getCoefficient() : null,
                            assessmentValue(courseRecords, ExamType.PROJECT, false),
                            assessmentValue(courseRecords, ExamType.EXAM, false),
                            assessmentValue(courseRecords, ExamType.DS, false),
                            assessmentValue(courseRecords, ExamType.TP, false),
                            average(courseRecords.stream()
                                    .filter(record -> record.getExam() == null || record.getExam().getSessionType() != SessionType.RESIT)
                                    .toList()),
                            null,
                            assessmentValue(courseRecords, null, true)
                    );
                })
                .toList();
    }

    private List<StudentRecentGrade> toRecentGrades(List<GradeEntity> records) {
        return records.stream()
                .sorted(Comparator
                        .comparing(this::recentSortValue, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(GradeEntity::getId, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(record -> {
                    ExamEntity exam = record.getExam();
                    CourseEntity course = exam != null ? exam.getCourse() : null;
                    Object grade = gradeValue(record);
                    return new StudentRecentGrade(
                            record.getId(),
                            course != null ? course.getTitle() : null,
                            examTypeLabel(exam != null ? exam.getType() : null),
                            grade,
                            grade instanceof Double value ? value : null,
                            record.getGradedAt()
                    );
                })
                .toList();
    }

    private Object assessmentValue(List<GradeEntity> records, ExamType type, boolean retake) {
        List<GradeEntity> matching = records.stream()
                .filter(record -> {
                    ExamEntity exam = record.getExam();
                    if (exam == null) return false;
                    if (retake) return exam.getSessionType() == SessionType.RESIT;
                    return exam.getSessionType() != SessionType.RESIT && exam.getType() == type;
                })
                .toList();

        if (matching.isEmpty()) return null;
        Double average = average(matching);
        if (average != null) return average;
        return matching.stream().anyMatch(record -> record.getResultStatus() == ResultStatus.ABSENT) ? "Abs." : null;
    }

    private Object gradeValue(GradeEntity record) {
        if (record.getResultStatus() == ResultStatus.ABSENT) {
            return "Abs.";
        }
        return scoreOn20(record);
    }

    private Double average(List<GradeEntity> records) {
        List<Double> scores = records.stream()
                .map(this::scoreOn20)
                .filter(Objects::nonNull)
                .toList();

        if (scores.isEmpty()) return null;
        return round(scores.stream().mapToDouble(Double::doubleValue).average().orElse(0));
    }

    private Double weightedAverage(List<StudentGradeSubject> subjects) {
        double weighted = 0;
        double coefficients = 0;

        for (StudentGradeSubject subject : subjects) {
            if (subject.average() == null) continue;
            double coefficient = subject.coefficient() != null ? subject.coefficient() : 1.0;
            weighted += subject.average() * coefficient;
            coefficients += coefficient;
        }

        return coefficients == 0 ? null : round(weighted / coefficients);
    }

    private Double scoreOn20(GradeEntity record) {
        if (record.getScore() == null) return null;
        double maxScore = record.getMaxScore() != null ? record.getMaxScore() : DEFAULT_MAX_SCORE;
        if (maxScore == 0) return round(record.getScore());
        return round((record.getScore() / maxScore) * DEFAULT_MAX_SCORE);
    }

    private List<GradeEntity> sortedBySession(List<GradeEntity> records) {
        return records.stream()
                .sorted(Comparator
                        .comparing((GradeEntity record) -> sessionSort(record.getExam()))
                        .thenComparing(record -> semesterName(record.getExam()), Comparator.nullsLast(String::compareTo)))
                .toList();
    }

    private List<GradeEntity> sortedBySubject(List<GradeEntity> records) {
        return records.stream()
                .sorted(Comparator
                        .comparing(this::unitName, Comparator.nullsLast(String::compareTo))
                        .thenComparing(record -> courseTitle(record.getExam()), Comparator.nullsLast(String::compareTo)))
                .toList();
    }

    private Integer sessionSort(ExamEntity exam) {
        return exam != null && exam.getSessionType() == SessionType.RESIT ? 1 : 0;
    }

    private String sessionLabel(ExamEntity exam) {
        return exam != null && exam.getSessionType() == SessionType.RESIT ? "Rattrapage" : "Session principale";
    }

    private String periodLabel(ExamEntity exam) {
        String semester = semesterName(exam);
        return semester == null ? null : "Periode / " + semester;
    }

    private String semesterName(ExamEntity exam) {
        SemesterEntity semester = exam != null ? exam.getSemester() : null;
        return semester != null ? semester.getName() : null;
    }

    private String unitName(GradeEntity record) {
        ExamEntity exam = record.getExam();
        CourseEntity course = exam != null ? exam.getCourse() : null;
        SubjectEntity subject = course != null ? course.getSubject() : null;
        return subject != null && !isBlank(subject.getSubjectName()) ? subject.getSubjectName() : "Unite non definie";
    }

    private String courseTitle(ExamEntity exam) {
        CourseEntity course = exam != null ? exam.getCourse() : null;
        return course != null ? course.getTitle() : null;
    }

    private String examTypeLabel(ExamType type) {
        if (type == null) return null;
        return switch (type) {
            case PROJECT -> "PROJET";
            case EXAM -> "EXAMEN";
            case DS -> "DEVOIR";
            case TP -> "TRAVAUX PRATIQUES";
            case ORAL -> "ORAL";
        };
    }

    private AcademicClassEntity firstAcademicClass(List<GradeEntity> records) {
        return records.stream()
                .map(GradeEntity::getExam)
                .filter(Objects::nonNull)
                .map(ExamEntity::getAcademicClass)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(null);
    }

    private AcademicYearEntity firstAcademicYear(List<GradeEntity> records) {
        return records.stream()
                .map(GradeEntity::getExam)
                .filter(Objects::nonNull)
                .map(ExamEntity::getSemester)
                .filter(Objects::nonNull)
                .map(SemesterEntity::getAcademicYear)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(null);
    }

    private StudentEnrollmentEntity latestEnrollment(StudentEntity student) {
        if (student.getEnrollments() == null || student.getEnrollments().isEmpty()) {
            return null;
        }

        return student.getEnrollments()
                .stream()
                .max(Comparator
                        .comparing((StudentEnrollmentEntity enrollment) -> enrollment.getEnrollmentDate() != null
                                ? enrollment.getEnrollmentDate()
                                : LocalDate.MIN)
                        .thenComparing(enrollment -> enrollment.getId() != null ? enrollment.getId() : Long.MIN_VALUE))
                .orElse(null);
    }

    private String fullName(StudentEntity student) {
        String fullName = (safe(student.getFirstName()) + " " + safe(student.getLastName())).trim();
        return fullName.isBlank() ? null : fullName;
    }

    private Long recentSortValue(GradeEntity record) {
        if (record.getGradedAt() != null) return record.getGradedAt().toEpochMilli();
        if (record.getCreatedAt() != null) return record.getCreatedAt().toEpochMilli();
        if (record.getExam() != null && record.getExam().getExamDate() != null) {
            return record.getExam().getExamDate().atStartOfDay().toInstant(ZoneOffset.UTC).toEpochMilli();
        }
        return null;
    }

    private Double round(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    private String mentionFor(double average) {
        if (average >= 16) return "Excellent";
        if (average >= 14) return "Tres bien";
        if (average >= 12) return "Bien";
        if (average >= 10) return "Passable";
        return "Insuffisant";
    }

    private String safe(String value) {
        return value == null ? "" : value.trim();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
