package com.iheb.gestion_universite.evaluation.result_management.service;

import com.iheb.gestion_universite.core.exceptions.ExamNotFoundException;
import com.iheb.gestion_universite.core.exceptions.StudentNotFoundException;
import com.iheb.gestion_universite.evaluation.exam.ExamEntity;
import com.iheb.gestion_universite.evaluation.exam.ExamRepo;
import com.iheb.gestion_universite.evaluation.exam.ExamStatus;
import com.iheb.gestion_universite.evaluation.grade.entities.GradeEntity;
import com.iheb.gestion_universite.evaluation.grade.entities.GradeStatus;
import com.iheb.gestion_universite.evaluation.grade.repositories.GradesRepo;
import com.iheb.gestion_universite.evaluation.grade_management.service.GradeManagementService;
import com.iheb.gestion_universite.evaluation.result_management.dto.CreateResultRequest;
import com.iheb.gestion_universite.evaluation.result_management.dto.PublishResultsRequest;
import com.iheb.gestion_universite.evaluation.result_management.dto.ResultDetailsResponse;
import com.iheb.gestion_universite.evaluation.result_management.dto.ResultResponse;
import com.iheb.gestion_universite.evaluation.result_management.dto.ResultSessionResponse;
import com.iheb.gestion_universite.evaluation.result_management.dto.ResultStatsResponse;
import com.iheb.gestion_universite.evaluation.result_management.dto.StudentResultOverviewResponse;
import com.iheb.gestion_universite.evaluation.result_management.dto.UpdateResultRequest;
import com.iheb.gestion_universite.evaluation.result_management.entity.ResultSessionEntity;
import com.iheb.gestion_universite.evaluation.result_management.entity.ResultSessionStatus;
import com.iheb.gestion_universite.evaluation.result_management.entity.ResultStatus;
import com.iheb.gestion_universite.evaluation.result_management.repository.ResultSessionRepository;
import com.iheb.gestion_universite.student_managment.student.StudentEntity;
import com.iheb.gestion_universite.student_managment.student.StudentRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ResultManagementService {

    private static final double DEFAULT_MAX_SCORE = 20.0;
    private static final double PASS_THRESHOLD_ON_20 = 10.0;

    private final ResultSessionRepository resultSessionRepository;
    private final ExamRepo examRepo;
    private final GradesRepo gradesRepo;
    private final StudentRepository studentRepository;
    private final GradeManagementService gradeManagementService;
    private final ResultManagementMapper mapper;

    public ResultSessionResponse createSession(CreateResultRequest request) {
        if (resultSessionRepository.existsByExamId(request.examId())) {
            throw new IllegalArgumentException("Result session already exists for exam id: " + request.examId());
        }
        ExamEntity exam = getExamOrThrow(request.examId());
        gradeManagementService.getDetails(exam.getId());

        ResultSessionEntity session = new ResultSessionEntity();
        session.setExam(exam);
        session.setStatus(ResultSessionStatus.DRAFT);
        ResultSessionEntity saved = resultSessionRepository.save(session);

        List<GradeEntity> records = getRecordsForExam(exam.getId());
        syncResultFields(records, false);
        gradesRepo.saveAll(records);
        return mapper.toSessionResponse(saved, records.size());
    }

    public List<ResultSessionResponse> getSessions() {
        return resultSessionRepository.findAllWithExam()
                .stream()
                .map(session -> mapper.toSessionResponse(session, gradesRepo.countByExamId(session.getExam().getId())))
                .toList();
    }

    public ResultDetailsResponse getSession(Long sessionId) {
        ResultSessionEntity session = getSessionOrThrow(sessionId);
        return toDetails(session);
    }

    public List<ResultResponse> getRecords(Long sessionId) {
        ResultSessionEntity session = getSessionOrThrow(sessionId);
        return getRecordsForSession(session).stream()
                .map(record -> mapper.toResultResponse(record, session.getId()))
                .toList();
    }

    public ResultResponse updateScore(Long recordId, UpdateResultRequest request) {
        GradeEntity record = getRecordOrThrow(recordId);
        ResultSessionEntity session = getSessionByExamOrThrow(record.getExam().getId());
        ensureDraft(session);
        validateScore(request.score(), record);

        record.setScore(request.score());
        record.setResultStatus(resolveStatus(request.score(), null, record));
        record.setComment(request.comment());
        record.setPublished(false);
        record.setStatus(request.score() == null ? GradeStatus.NOT_GRADED : GradeStatus.DRAFT);
        record.setGradedAt(request.score() == null ? null : Instant.now());
        refreshWeightedScoreAndMention(record, request.mention(), true);

        return mapper.toResultResponse(gradesRepo.save(record), session.getId());
    }

    public ResultResponse updateStatus(Long recordId, UpdateResultRequest request) {
        if (request.status() == null) {
            throw new IllegalArgumentException("Result status is required");
        }

        GradeEntity record = getRecordOrThrow(recordId);
        ResultSessionEntity session = getSessionByExamOrThrow(record.getExam().getId());
        ensureDraft(session);

        applyExplicitStatus(record, request.status());
        if (request.comment() != null) {
            record.setComment(request.comment());
        }
        refreshWeightedScoreAndMention(record, request.mention(), request.mention() != null);
        record.setPublished(false);

        return mapper.toResultResponse(gradesRepo.save(record), session.getId());
    }

    public ResultDetailsResponse validateSession(Long sessionId) {
        ResultSessionEntity session = getSessionOrThrow(sessionId);
        ensureDraft(session);

        List<GradeEntity> records = getRecordsForSession(session);
        syncResultFields(records, false);
        records.forEach(record -> {
            if (record.getStatus() != GradeStatus.PUBLISHED) {
                record.setStatus(GradeStatus.VALIDATED);
            }
        });
        gradesRepo.saveAll(records);

        session.setStatus(ResultSessionStatus.VALIDATED);
        session.setValidatedAt(Instant.now());
        resultSessionRepository.save(session);
        return toDetails(session);
    }

    public ResultDetailsResponse publishSession(Long sessionId, PublishResultsRequest request) {
        ResultSessionEntity session = getSessionOrThrow(sessionId);
        if (session.getStatus() != ResultSessionStatus.VALIDATED) {
            throw new IllegalArgumentException("Only validated result sessions can be published");
        }

        List<GradeEntity> records = getRecordsForSession(session);
        syncResultFields(records, false);
        if (records.stream().anyMatch(record -> record.getResultStatus() == ResultStatus.PENDING)) {
            throw new IllegalArgumentException("All non-absent students must have a result before publication");
        }
        records.forEach(record -> {
            record.setPublished(true);
            record.setStatus(GradeStatus.PUBLISHED);
        });
        gradesRepo.saveAll(records);

        session.setStatus(ResultSessionStatus.PUBLISHED);
        session.setPublishedAt(Instant.now());
        resultSessionRepository.save(session);

        ExamEntity exam = session.getExam();
        exam.setStatus(ExamStatus.PUBLISHED);
        examRepo.save(exam);
        return toDetails(session);
    }

    public ResultStatsResponse getStats(Long sessionId) {
        ResultSessionEntity session = getSessionOrThrow(sessionId);
        return mapper.toStats(getRecordsForSession(session));
    }

    public StudentResultOverviewResponse getStudentResults(Long studentId) {
        StudentEntity student = studentRepository.findById(studentId)
                .orElseThrow(() -> new StudentNotFoundException("Student not found with id: " + studentId));
        List<GradeEntity> records = gradesRepo.findPublishedResultsByStudentId(studentId);
        return mapper.toStudentOverview(student, records);
    }

    private ResultDetailsResponse toDetails(ResultSessionEntity session) {
        List<GradeEntity> records = getRecordsForSession(session);
        return new ResultDetailsResponse(
                mapper.toSessionResponse(session, records.size()),
                records.stream().map(record -> mapper.toResultResponse(record, session.getId())).toList(),
                mapper.toStats(records)
        );
    }

    private List<GradeEntity> getRecordsForSession(ResultSessionEntity session) {
        if (session.getStatus() == ResultSessionStatus.DRAFT) {
            gradeManagementService.getDetails(session.getExam().getId());
        }
        List<GradeEntity> records = getRecordsForExam(session.getExam().getId());
        syncResultFields(records, false);
        return records;
    }

    private List<GradeEntity> getRecordsForExam(Long examId) {
        return gradesRepo.findByExamIdWithStudent(examId);
    }

    private void syncResultFields(List<GradeEntity> records, boolean overrideMention) {
        records.forEach(record -> {
            record.setResultStatus(resolveStatus(record.getScore(), record.getResultStatus(), record));
            refreshWeightedScoreAndMention(record, record.getMention(), overrideMention);
            if (record.getPublished() == null) {
                record.setPublished(false);
            }
        });
    }

    private void applyExplicitStatus(GradeEntity record, ResultStatus status) {
        if (status == ResultStatus.ABSENT) {
            record.setScore(null);
            record.setWeightedScore(null);
            record.setMention("Absent");
            record.setResultStatus(ResultStatus.ABSENT);
            record.setStatus(GradeStatus.NOT_GRADED);
            record.setGradedAt(null);
            return;
        }
        if (status == ResultStatus.PENDING) {
            record.setScore(null);
            record.setWeightedScore(null);
            record.setMention(null);
            record.setResultStatus(ResultStatus.PENDING);
            record.setStatus(GradeStatus.NOT_GRADED);
            record.setGradedAt(null);
            return;
        }
        if (record.getScore() == null) {
            throw new IllegalArgumentException("A score is required before setting PASSED or FAILED");
        }
        ResultStatus computed = resolveStatus(record.getScore(), null, record);
        if (computed != status) {
            throw new IllegalArgumentException("Result status does not match the score");
        }
        record.setResultStatus(status);
        record.setStatus(GradeStatus.DRAFT);
        record.setGradedAt(record.getGradedAt() != null ? record.getGradedAt() : Instant.now());
    }

    private ResultStatus resolveStatus(Double score, ResultStatus currentStatus, GradeEntity record) {
        if (score == null) {
            return currentStatus == ResultStatus.ABSENT ? ResultStatus.ABSENT : ResultStatus.PENDING;
        }
        double normalizedScore = normalizeOn20(score, maxScore(record));
        return normalizedScore >= PASS_THRESHOLD_ON_20 ? ResultStatus.PASSED : ResultStatus.FAILED;
    }

    private void refreshWeightedScoreAndMention(GradeEntity record, String requestedMention, boolean overrideMention) {
        if (record.getScore() == null) {
            record.setWeightedScore(null);
            if (record.getResultStatus() != ResultStatus.ABSENT) {
                record.setMention(null);
            }
            return;
        }

        double normalizedScore = normalizeOn20(record.getScore(), maxScore(record));
        double weight = record.getExam() != null && record.getExam().getWeight() != null ? record.getExam().getWeight() : 1.0;
        record.setWeightedScore(round(normalizedScore * weight));
        if (overrideMention || record.getMention() == null || record.getMention().isBlank()) {
            record.setMention(requestedMention != null && !requestedMention.isBlank()
                    ? requestedMention.trim()
                    : mentionFor(normalizedScore));
        }
    }

    private void validateScore(Double score, GradeEntity record) {
        if (score == null) return;
        double maxScore = maxScore(record);
        if (score < 0) {
            throw new IllegalArgumentException("Score must be greater than or equal to 0");
        }
        if (score > maxScore) {
            throw new IllegalArgumentException("Score cannot be greater than max score " + maxScore);
        }
    }

    private void ensureDraft(ResultSessionEntity session) {
        if (session.getStatus() != ResultSessionStatus.DRAFT) {
            throw new IllegalArgumentException("Only draft result sessions can be modified");
        }
    }

    private ExamEntity getExamOrThrow(Long examId) {
        return examRepo.findByIdWithRelations(examId)
                .orElseThrow(() -> new ExamNotFoundException("Exam not found with id: " + examId));
    }

    private ResultSessionEntity getSessionOrThrow(Long sessionId) {
        return resultSessionRepository.findByIdWithExam(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Result session not found with id: " + sessionId));
    }

    private ResultSessionEntity getSessionByExamOrThrow(Long examId) {
        return resultSessionRepository.findByExamId(examId)
                .orElseThrow(() -> new IllegalArgumentException("Result session not found for exam id: " + examId));
    }

    private GradeEntity getRecordOrThrow(Long recordId) {
        return gradesRepo.findByIdWithResultRelations(recordId)
                .orElseThrow(() -> new IllegalArgumentException("Result record not found with id: " + recordId));
    }

    private double maxScore(GradeEntity record) {
        if (record.getMaxScore() != null) return record.getMaxScore();
        if (record.getExam() != null && record.getExam().getMaxScore() != null) return record.getExam().getMaxScore();
        return DEFAULT_MAX_SCORE;
    }

    private double normalizeOn20(Double score, double maxScore) {
        return maxScore == 0 ? score : (score / maxScore) * DEFAULT_MAX_SCORE;
    }

    private String mentionFor(double scoreOn20) {
        if (scoreOn20 >= 16) return "Excellent";
        if (scoreOn20 >= 14) return "Tres bien";
        if (scoreOn20 >= 12) return "Bien";
        if (scoreOn20 >= 10) return "Passable";
        return "Insuffisant";
    }

    private double round(double value) {
        return BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
