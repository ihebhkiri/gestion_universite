package com.iheb.gestion_universite.academic.academic_year;

import com.iheb.gestion_universite.academic.academic_year.dto.AcademicYearDataResponse;
import com.iheb.gestion_universite.academic.academic_year.dto.AcademicYearStatsResponse;
import com.iheb.gestion_universite.academic.academic_year.dto.AddAcademicYearRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AcademicYearService {

    private final AcademicYearRepository academicYearRepository;

    public AcademicYearEntity create(AddAcademicYearRequest request) {
        validateDates(request.startDate(), request.endDate());
        if (academicYearRepository.existsByLabelIgnoreCase(request.label())) {
            throw new RuntimeException("Academic year already exists: " + request.label());
        }
        AcademicYearEntity entity = new AcademicYearEntity();
        entity.setLabel(normalizeLabel(request.label()));
        entity.setStartDate(request.startDate());
        entity.setEndDate(request.endDate());
        entity.setActive(request.active());

        if (entity.isActive()) {
            deactivateAll();
        }
        return academicYearRepository.save(entity);
    }

    public AcademicYearEntity getById(Long id) {
        return academicYearRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Academic year not found with id: " + id));
    }

    public List<AcademicYearDataResponse> getAll() {
        return academicYearRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public AcademicYearDataResponse getOne(Long id) {
        return mapToResponse(getById(id));
    }

    public AcademicYearEntity update(Long id, AddAcademicYearRequest request) {
        validateDates(request.startDate(), request.endDate());
        AcademicYearEntity existing = getById(id);
        String nextLabel = normalizeLabel(request.label());
        if (!existing.getLabel().equalsIgnoreCase(nextLabel) && academicYearRepository.existsByLabelIgnoreCase(nextLabel)) {
            throw new RuntimeException("Academic year already exists: " + nextLabel);
        }

        existing.setLabel(nextLabel);
        existing.setStartDate(request.startDate());
        existing.setEndDate(request.endDate());
        existing.setActive(request.active());

        if (existing.isActive()) {
            deactivateAllExcept(existing.getId());
        }
        return academicYearRepository.save(existing);
    }

    public void delete(Long id) {
        AcademicYearEntity existing = getById(id);
        academicYearRepository.delete(existing);
    }

    public AcademicYearStatsResponse getStats() {
        long total = academicYearRepository.count();
        long active = academicYearRepository.countByActiveTrue();
        return new AcademicYearStatsResponse(total, active);
    }

    private AcademicYearDataResponse mapToResponse(AcademicYearEntity entity) {
        return new AcademicYearDataResponse(
                entity.getId(),
                entity.getLabel(),
                entity.getStartDate(),
                entity.getEndDate(),
                entity.isActive()
        );
    }

    private void validateDates(java.time.LocalDate start, java.time.LocalDate end) {
        if (start != null && end != null && end.isBefore(start)) {
            throw new RuntimeException("End date must be after start date");
        }
    }

    private String normalizeLabel(String label) {
        return label == null ? null : label.trim().toUpperCase();
    }

    private void deactivateAll() {
        academicYearRepository.findAll().forEach(y -> y.setActive(false));
    }

    private void deactivateAllExcept(Long id) {
        academicYearRepository.findAll().forEach(y -> {
            if (!y.getId().equals(id)) {
                y.setActive(false);
            }
        });
    }
}
