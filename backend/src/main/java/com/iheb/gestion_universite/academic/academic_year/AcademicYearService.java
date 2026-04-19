package com.iheb.gestion_universite.academic.academic_year;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AcademicYearService {

    private final AcademicYearRepository academicYearRepository;

    public AcademicYearEntity create(AcademicYearEntity request) {
        if (academicYearRepository.existsByLabel(request.getLabel())) {
            throw new RuntimeException("Academic year already exists: " + request.getLabel());
        }
        return academicYearRepository.save(request);
    }

    public AcademicYearEntity getById(Long id) {
        return academicYearRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Academic year not found with id: " + id));
    }

    public List<AcademicYearEntity> getAll() {
        return academicYearRepository.findAll();
    }

    public AcademicYearEntity update(Long id, AcademicYearEntity request) {
        AcademicYearEntity existing = getById(id);
        existing.setLabel(request.getLabel());
        existing.setStartDate(request.getStartDate());
        existing.setEndDate(request.getEndDate());
        existing.setActive(request.isActive());
        return academicYearRepository.save(existing);
    }

    public void delete(Long id) {
        AcademicYearEntity existing = getById(id);
        academicYearRepository.delete(existing);
    }
}
