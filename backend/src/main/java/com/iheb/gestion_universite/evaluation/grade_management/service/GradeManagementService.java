package com.iheb.gestion_universite.evaluation.grade_management.service;

import com.iheb.gestion_universite.academic.academic_class.AcademicClassEntity;
import com.iheb.gestion_universite.academic.academic_class.ClassRepository;
import com.iheb.gestion_universite.academic.semester.SemesterRepository;
import com.iheb.gestion_universite.core.exceptions.ExamAlreadyExistsException;
import com.iheb.gestion_universite.core.exceptions.ExamNotFoundException;
import com.iheb.gestion_universite.evaluation.exam.ExamEntity;
import com.iheb.gestion_universite.evaluation.exam.ExamRepo;
import com.iheb.gestion_universite.evaluation.exam.ExamStatus;
import com.iheb.gestion_universite.evaluation.exam.SessionType;
import com.iheb.gestion_universite.evaluation.grade.entities.GradeEntity;
import com.iheb.gestion_universite.evaluation.grade.entities.GradeStatus;
import com.iheb.gestion_universite.evaluation.grade.repositories.GradesRepo;
import com.iheb.gestion_universite.evaluation.grade_management.dto.CreateGradeExamRequest;
import com.iheb.gestion_universite.evaluation.grade_management.dto.GradeStatsResponse;
import com.iheb.gestion_universite.evaluation.grade_management.dto.GradebookDetailsResponse;
import com.iheb.gestion_universite.evaluation.grade_management.dto.GradebookExamResponse;
import com.iheb.gestion_universite.evaluation.grade_management.dto.SaveGradeRecordItemRequest;
import com.iheb.gestion_universite.evaluation.grade_management.dto.SaveGradeRecordsRequest;
import com.iheb.gestion_universite.evaluation.grade_management.dto.UpdateGradeRecordRequest;
import com.iheb.gestion_universite.evaluation.result_management.entity.ResultSessionStatus;
import com.iheb.gestion_universite.evaluation.result_management.repository.ResultSessionRepository;
import com.iheb.gestion_universite.student_managment.student.StudentEntity;
import com.iheb.gestion_universite.student_managment.student_enrollment.EnrollmentRepo;
import com.iheb.gestion_universite.student_managment.student_enrollment.EnrollmentStatus;
import com.iheb.gestion_universite.student_managment.student_group.GroupRepository;
import com.iheb.gestion_universite.teaching.course.CourseRepository;
import com.iheb.gestion_universite.teaching.room.RoomRepository;
import com.iheb.gestion_universite.teaching.teacher.TeacherRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class GradeManagementService {

    private static final double DEFAULT_MAX_SCORE = 20.0;

    private final ExamRepo examRepo;
    private final GradesRepo gradesRepo;
    private final CourseRepository courseRepository;
    private final ClassRepository classRepository;
    private final GroupRepository groupRepository;
    private final EnrollmentRepo enrollmentRepo;
    private final TeacherRepository teacherRepository;
    private final RoomRepository roomRepository;
    private final SemesterRepository semesterRepository;
    private final ResultSessionRepository resultSessionRepository;
    private final GradeManagementMapper mapper;

    public GradebookDetailsResponse createExam(CreateGradeExamRequest request) {
        validateSchedule(request.examDate(), request.startTime(), request.endTime());
        SessionType sessionType = request.sessionType() != null ? request.sessionType() : SessionType.MAIN;
        if (examRepo.existsByCourseIdAndTitleAndTypeAndSessionType(request.courseId(), request.title().trim(), request.type(), sessionType)) {
            throw new ExamAlreadyExistsException("Exam already exists for this course and session");
        }

        ExamEntity exam = new ExamEntity();
        exam.setTitle(request.title().trim());
        exam.setCourse(courseRepository.findById(request.courseId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + request.courseId())));
        exam.setAcademicClass(classRepository.findById(request.classId())
                .orElseThrow(() -> new IllegalArgumentException("Class not found with id: " + request.classId())));
        exam.setStudentGroup(request.groupId() != null
                ? groupRepository.findById(request.groupId())
                        .orElseThrow(() -> new IllegalArgumentException("Group not found with id: " + request.groupId()))
                : null);
        exam.setRoom(request.roomId() != null
                ? roomRepository.findById(request.roomId()).orElseThrow(() -> new IllegalArgumentException("Room not found with id: " + request.roomId()))
                : null);
        exam.setSupervisor(request.supervisorId() != null
                ? teacherRepository.findById(request.supervisorId()).orElseThrow(() -> new IllegalArgumentException("Teacher not found with id: " + request.supervisorId()))
                : null);
        exam.setSemester(request.semesterId() != null
                ? semesterRepository.findById(request.semesterId()).orElseThrow(() -> new IllegalArgumentException("Semester not found with id: " + request.semesterId()))
                : null);
        exam.setExamDate(request.examDate());
        exam.setStartTime(request.startTime());
        exam.setEndTime(request.endTime());
        exam.setType(request.type());
        exam.setSessionType(sessionType);
        exam.setStatus(request.status() != null ? request.status() : ExamStatus.DRAFT);
        exam.setDuration(request.duration());
        exam.setWeight(request.weight());
        exam.setMaxScore(resolveMaxScore(request.maxScore()));
        exam.setInstructions(request.instructions());
        exam.setCreatedAt(Instant.now());

        ExamEntity savedExam = examRepo.save(exam);
        ensureGradeRecords(savedExam);
        return getDetails(savedExam.getId());
    }

    public List<GradebookExamResponse> getExams(Long classId, Long courseId) {
        return examRepo.findAllWithRelations()
                .stream()
                .filter(exam -> classId == null || exam.getAcademicClass() != null && classId.equals(exam.getAcademicClass().getId()))
                .filter(exam -> courseId == null || exam.getCourse() != null && courseId.equals(exam.getCourse().getId()))
                .sorted(Comparator
                        .comparing((ExamEntity exam) -> exam.getExamDate() != null ? exam.getExamDate() : LocalDate.MAX)
                        .thenComparing(exam -> exam.getStartTime() != null ? exam.getStartTime() : LocalTime.MAX))
                .map(mapper::toExamResponse)
                .toList();
    }

    public GradebookDetailsResponse getDetails(Long examId) {
        ExamEntity exam = getExamOrThrow(examId);
        ensureGradeRecords(exam);
        List<GradeEntity> records = gradesRepo.findByExamIdWithStudent(examId);
        return new GradebookDetailsResponse(
                mapper.toExamResponse(exam),
                records.stream().map(mapper::toRecordResponse).toList(),
                mapper.toStats(exam, records)
        );
    }

    public GradebookDetailsResponse updateGrade(Long recordId, UpdateGradeRecordRequest request) {
        GradeEntity record = getRecordOrThrow(recordId);
        ensureExamCanBeEdited(record.getExam());
        applyGradeChange(record, request.score(), request.comment(), request.status());
        gradesRepo.save(record);
        return getDetails(record.getExam().getId());
    }

    public GradebookDetailsResponse saveDraftGrades(Long examId, SaveGradeRecordsRequest request) {
        ExamEntity exam = getExamOrThrow(examId);
        ensureExamCanBeEdited(exam);
        for (SaveGradeRecordItemRequest item : request.records()) {
            GradeEntity record = getRecordOrThrow(item.recordId());
            if (!record.getExam().getId().equals(examId)) {
                throw new IllegalArgumentException("Grade record " + item.recordId() + " does not belong to exam " + examId);
            }
            applyGradeChange(record, item.score(), item.comment(), item.status() != null ? item.status() : GradeStatus.DRAFT);
            gradesRepo.save(record);
        }
        return getDetails(examId);
    }

    public GradebookDetailsResponse validateGrade(Long recordId) {
        GradeEntity record = getRecordOrThrow(recordId);
        ensureExamCanBeEdited(record.getExam());
        if (record.getScore() == null) {
            throw new IllegalArgumentException("A grade must have a score before validation");
        }
        record.setStatus(GradeStatus.VALIDATED);
        record.setGradedAt(record.getGradedAt() != null ? record.getGradedAt() : Instant.now());
        gradesRepo.save(record);
        return getDetails(record.getExam().getId());
    }

    public GradebookDetailsResponse publishExam(Long examId) {
        ExamEntity exam = getExamOrThrow(examId);
        ensureGradeRecords(exam);
        List<GradeEntity> records = gradesRepo.findByExamIdWithStudent(examId);
        if (records.stream().anyMatch(record -> record.getScore() == null)) {
            throw new IllegalArgumentException("All students must be graded before publishing");
        }
        records.forEach(record -> {
            record.setStatus(GradeStatus.PUBLISHED);
            record.setGradedAt(record.getGradedAt() != null ? record.getGradedAt() : Instant.now());
        });
        gradesRepo.saveAll(records);
        exam.setStatus(ExamStatus.PUBLISHED);
        examRepo.save(exam);
        return getDetails(examId);
    }

    public GradebookDetailsResponse closeExam(Long examId) {
        ExamEntity exam = getExamOrThrow(examId);
        if (exam.getStatus() == ExamStatus.PUBLISHED) {
            throw new IllegalArgumentException("Published exams cannot be closed again");
        }
        exam.setStatus(ExamStatus.COMPLETED);
        examRepo.save(exam);
        return getDetails(examId);
    }

    public GradeStatsResponse getStats(Long examId) {
        ExamEntity exam = getExamOrThrow(examId);
        ensureGradeRecords(exam);
        return mapper.toStats(exam, gradesRepo.findByExamIdWithStudent(examId));
    }

    private void applyGradeChange(GradeEntity record, Double score, String comment, GradeStatus status) {
        if (status == GradeStatus.PUBLISHED) {
            throw new IllegalArgumentException("Grades are published from the exam publication endpoint");
        }
        validateScore(score, record.getExam());
        record.setScore(score);
        record.setComment(comment);
        record.setMaxScore(resolveMaxScore(record.getExam().getMaxScore()));
        if (score == null) {
            record.setStatus(GradeStatus.NOT_GRADED);
            record.setGradedAt(null);
        } else {
            record.setStatus(status != null ? status : GradeStatus.DRAFT);
            record.setGradedAt(Instant.now());
        }
    }

    private void ensureGradeRecords(ExamEntity exam) {
        List<StudentEntity> students = findTargetStudents(exam);
        double maxScore = resolveMaxScore(exam.getMaxScore());
        students.forEach(student -> gradesRepo.findByExamIdAndStudentId(exam.getId(), student.getId())
                .ifPresentOrElse(record -> {
                    if (record.getMaxScore() == null) {
                        record.setMaxScore(maxScore);
                        gradesRepo.save(record);
                    }
                }, () -> {
                    GradeEntity record = new GradeEntity();
                    record.setExam(exam);
                    record.setStudent(student);
                    record.setMaxScore(maxScore);
                    record.setStatus(GradeStatus.NOT_GRADED);
                    gradesRepo.save(record);
                }));
    }

    private List<StudentEntity> findTargetStudents(ExamEntity exam) {
        List<StudentEntity> students;
        if (exam.getStudentGroup() != null) {
            students = enrollmentRepo.findByGroupIdAndStatus(exam.getStudentGroup().getId(), EnrollmentStatus.CONFIRMED)
                    .stream()
                    .map(enrollment -> enrollment.getStudent())
                    .toList();
        } else {
            AcademicClassEntity academicClass = exam.getAcademicClass();
            if (academicClass == null) {
                return List.of();
            }
            students = enrollmentRepo.findByGroupAcademicClassIdAndStatus(academicClass.getId(), EnrollmentStatus.CONFIRMED)
                    .stream()
                    .map(enrollment -> enrollment.getStudent())
                    .toList();
        }
        Map<Long, StudentEntity> uniqueStudents = new LinkedHashMap<>();
        students.stream()
                .filter(student -> student != null && student.getId() != null)
                .forEach(student -> uniqueStudents.putIfAbsent(student.getId(), student));
        return uniqueStudents.values().stream().toList();
    }

    private void validateScore(Double score, ExamEntity exam) {
        if (score == null) return;
        double maxScore = resolveMaxScore(exam.getMaxScore());
        if (score < 0) {
            throw new IllegalArgumentException("Score must be greater than or equal to 0");
        }
        if (score > maxScore) {
            throw new IllegalArgumentException("Score cannot be greater than max score " + maxScore);
        }
    }

    private void validateSchedule(LocalDate examDate, LocalTime startTime, LocalTime endTime) {
        if ((startTime == null && endTime != null) || (startTime != null && endTime == null)) {
            throw new IllegalArgumentException("Start time and end time must be provided together");
        }
        if (startTime != null && !endTime.isAfter(startTime)) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        if (examDate == null && (startTime != null || endTime != null)) {
            throw new IllegalArgumentException("Exam date is required when exam time is provided");
        }
    }

    private void ensureExamCanBeEdited(ExamEntity exam) {
        resultSessionRepository.findByExamId(exam.getId()).ifPresent(session -> {
            if (session.getStatus() != ResultSessionStatus.DRAFT) {
                throw new IllegalArgumentException("Grades cannot be edited after result session validation");
            }
        });
        if (exam.getStatus() == ExamStatus.PUBLISHED) {
            throw new IllegalArgumentException("Published exams cannot be edited");
        }
        if (exam.getStatus() == ExamStatus.CANCELLED) {
            throw new IllegalArgumentException("Cancelled exams cannot be edited");
        }
        if (exam.getStatus() == ExamStatus.COMPLETED) {
            throw new IllegalArgumentException("Completed exams cannot be edited");
        }
    }

    private ExamEntity getExamOrThrow(Long examId) {
        return examRepo.findByIdWithRelations(examId)
                .orElseThrow(() -> new ExamNotFoundException("Exam not found with id: " + examId));
    }

    private GradeEntity getRecordOrThrow(Long recordId) {
        return gradesRepo.findById(recordId)
                .orElseThrow(() -> new IllegalArgumentException("Grade record not found with id: " + recordId));
    }

    private double resolveMaxScore(Double maxScore) {
        return maxScore != null ? maxScore : DEFAULT_MAX_SCORE;
    }
}
