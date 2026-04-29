package com.iheb.gestion_universite.academic.semester;

import com.iheb.gestion_universite.academic.academic_year.AcademicYearEntity;
import com.iheb.gestion_universite.academic.academic_year.AcademicYearRepository;
import com.iheb.gestion_universite.academic.semester.dto.AddSemesterRequest;
import com.iheb.gestion_universite.academic.semester.dto.SemesterDataResponse;
import com.iheb.gestion_universite.academic.semester.dto.SemesterStatsResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SemesterService {

    private final SemesterRepository semesterRepository;
    private final AcademicYearRepository academicYearRepository;

    public void create(AddSemesterRequest request) {
        AcademicYearEntity year = getAcademicYear(request.academicYearId());
        validateDates(request.startDate(), request.endDate(), request.examStartDate(), request.examEndDate());
        ensureUniqueName(request.name(), request.academicYearId());

        SemesterEntity entity = new SemesterEntity();
        entity.setName(normalizeName(request.name()));
        entity.setAcademicYear(year);
        entity.setStartDate(request.startDate());
        entity.setEndDate(request.endDate());
        entity.setStatus(request.status());
        entity.setExamStartDate(request.examStartDate());
        entity.setExamEndDate(request.examEndDate());
        entity.setDescription(request.description());
        semesterRepository.save(entity);
    }

    public List<SemesterDataResponse> getAll() {
        return semesterRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public SemesterDataResponse getOne(Long id) {
        return mapToResponse(getById(id));
    }

    public SemesterEntity getEntityById(Long id) {
        return getById(id);
    }

    public void update(Long id, AddSemesterRequest request) {
        SemesterEntity existing = getById(id);
        AcademicYearEntity year = getAcademicYear(request.academicYearId());
        validateDates(request.startDate(), request.endDate(), request.examStartDate(), request.examEndDate());
        ensureUniqueNameForUpdate(id, request.name(), request.academicYearId());

        existing.setName(normalizeName(request.name()));
        existing.setAcademicYear(year);
        existing.setStartDate(request.startDate());
        existing.setEndDate(request.endDate());
        existing.setStatus(request.status());
        existing.setExamStartDate(request.examStartDate());
        existing.setExamEndDate(request.examEndDate());
        existing.setDescription(request.description());
        semesterRepository.save(existing);
    }

    public void delete(Long id) {
        SemesterEntity existing = getById(id);
        semesterRepository.delete(existing);
    }

    public SemesterStatsResponse getStats() {
        return new SemesterStatsResponse(
                semesterRepository.count(),
                semesterRepository.countByStatus(SemesterStatus.PLANNED),
                semesterRepository.countByStatus(SemesterStatus.REGISTRATION_OPEN),
                semesterRepository.countByStatus(SemesterStatus.IN_PROGRESS),
                semesterRepository.countByStatus(SemesterStatus.EXAMS),
                semesterRepository.countByStatus(SemesterStatus.CLOSED)
        );
    }

    private SemesterEntity getById(Long id) {
        return semesterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Semester not found with id: " + id));
    }

    private AcademicYearEntity getAcademicYear(Long id) {
        return academicYearRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Academic year not found with id: " + id));
    }

    private void ensureUniqueName(String name, Long academicYearId) {
        if (semesterRepository.existsByNameIgnoreCaseAndAcademicYearId(name, academicYearId)) {
            throw new RuntimeException("Semester already exists for this academic year");
        }
    }

    private void ensureUniqueNameForUpdate(Long id, String name, Long academicYearId) {
        if (semesterRepository.existsByNameIgnoreCaseAndAcademicYearIdAndIdNot(name, academicYearId, id)) {
            throw new RuntimeException("Semester already exists for this academic year");
        }
    }

    private void validateDates(LocalDate start, LocalDate end, LocalDate examStart, LocalDate examEnd) {
        if (end.isBefore(start)) {
            throw new RuntimeException("End date must be after start date");
        }
        if (examStart != null && examEnd != null && examEnd.isBefore(examStart)) {
            throw new RuntimeException("Exam end date must be after exam start date");
        }
        if (examStart != null && examStart.isBefore(start)) {
            throw new RuntimeException("Exam start date must be within semester range");
        }
        if (examEnd != null && examEnd.isAfter(end)) {
            throw new RuntimeException("Exam end date must be within semester range");
        }
    }

    private String normalizeName(String name) {
        return name == null ? null : name.trim().toUpperCase();
    }

    private SemesterDataResponse mapToResponse(SemesterEntity entity) {
        return new SemesterDataResponse(
                entity.getId(),
                entity.getName(),
                entity.getAcademicYear() != null ? entity.getAcademicYear().getId() : null,
                entity.getAcademicYear() != null ? entity.getAcademicYear().getLabel() : null,
                entity.getStartDate(),
                entity.getEndDate(),
                entity.getStatus(),
                entity.getExamStartDate(),
                entity.getExamEndDate(),
                entity.getDescription()
        );
    }
}

