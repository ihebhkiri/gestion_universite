package com.iheb.gestion_universite.academic.academic_class;

import com.iheb.gestion_universite.academic.academic_year.AcademicYearEntity;
import com.iheb.gestion_universite.academic.academic_year.AcademicYearRepository;
import com.iheb.gestion_universite.academic.academic_class.dto.AcademicClassDataResponse;
import com.iheb.gestion_universite.academic.academic_class.dto.AcademicClassStatsResponse;
import com.iheb.gestion_universite.academic.academic_class.dto.AddAcademicClassRequest;
import com.iheb.gestion_universite.academic.program.ProgramEntity;
import com.iheb.gestion_universite.academic.program.ProgramRepository;
import com.iheb.gestion_universite.academic.speciality.SpecialityEntity;
import com.iheb.gestion_universite.academic.speciality.SpecialityRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ClassService {

    private final ClassRepository classRepository;
    private final ProgramRepository programRepository;
    private final SpecialityRepository specialityRepository;
    private final AcademicYearRepository academicYearRepository;

    public AcademicClassEntity create(AddAcademicClassRequest request) {
        ProgramEntity program = programRepository.findById(request.programId())
                .orElseThrow(() -> new RuntimeException("Program not found with id: " + request.programId()));
        SpecialityEntity speciality = specialityRepository.findById(request.specialityId())
                .orElseThrow(() -> new RuntimeException("Speciality not found with id: " + request.specialityId()));
        AcademicYearEntity academicYear = academicYearRepository.findById(request.academicYearId())
                .orElseThrow(() -> new RuntimeException("Academic year not found with id: " + request.academicYearId()));

        if (classRepository.existsByLevelAndSessionAndProgramIdAndSpecialityIdAndAcademicYearId(
                request.level(), request.session(), request.programId(), request.specialityId(), request.academicYearId())) {
            throw new RuntimeException("Class already exists for this combination");
        }

        AcademicClassEntity entity = new AcademicClassEntity();
        entity.setLevel(request.level());
        entity.setSession(request.session());
        entity.setProgram(program);
        entity.setSpeciality(speciality);
        entity.setAcademicYear(academicYear);
        return classRepository.save(entity);
    }

    public AcademicClassEntity getById(Long id) {
        return classRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found with id: " + id));
    }

    public List<AcademicClassDataResponse> getAll() {
        return classRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public AcademicClassEntity update(Long id, AddAcademicClassRequest request) {
        AcademicClassEntity existing = getById(id);
        ProgramEntity program = programRepository.findById(request.programId())
                .orElseThrow(() -> new RuntimeException("Program not found with id: " + request.programId()));
        SpecialityEntity speciality = specialityRepository.findById(request.specialityId())
                .orElseThrow(() -> new RuntimeException("Speciality not found with id: " + request.specialityId()));
        AcademicYearEntity academicYear = academicYearRepository.findById(request.academicYearId())
                .orElseThrow(() -> new RuntimeException("Academic year not found with id: " + request.academicYearId()));

        if (classRepository.existsByLevelAndSessionAndProgramIdAndSpecialityIdAndAcademicYearIdAndIdNot(
                request.level(), request.session(), request.programId(), request.specialityId(), request.academicYearId(), id)) {
            throw new RuntimeException("Class already exists for this combination");
        }

        existing.setLevel(request.level());
        existing.setSession(request.session());
        existing.setProgram(program);
        existing.setSpeciality(speciality);
        existing.setAcademicYear(academicYear);
        return classRepository.save(existing);
    }

    public void delete(Long id) {
        AcademicClassEntity existing = getById(id);
        classRepository.delete(existing);
    }

    public AcademicClassDataResponse getOne(Long id) {
        return mapToResponse(getById(id));
    }

    public AcademicClassStatsResponse getStats() {
        return new AcademicClassStatsResponse(
                classRepository.count(),
                programRepository.count(),
                specialityRepository.count(),
                academicYearRepository.count()
        );
    }

    private AcademicClassDataResponse mapToResponse(AcademicClassEntity entity) {
        return new AcademicClassDataResponse(
                entity.getId(),
                entity.getCode(),
                entity.getLevel(),
                entity.getSession(),
                entity.getProgram() != null ? entity.getProgram().getId() : null,
                entity.getProgram() != null ? entity.getProgram().getCode() : null,
                entity.getProgram() != null ? entity.getProgram().getName() : null,
                entity.getSpeciality() != null ? entity.getSpeciality().getId() : null,
                entity.getSpeciality() != null ? entity.getSpeciality().getCode() : null,
                entity.getSpeciality() != null ? entity.getSpeciality().getName() : null,
                entity.getAcademicYear() != null ? entity.getAcademicYear().getId() : null,
                entity.getAcademicYear() != null ? entity.getAcademicYear().getLabel() : null
        );
    }
}
