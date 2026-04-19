package com.iheb.gestion_universite.academic.academic_class;

import com.iheb.gestion_universite.academic.academic_year.AcademicYearEntity;
import com.iheb.gestion_universite.academic.academic_year.AcademicYearRepository;
import com.iheb.gestion_universite.academic.program.ProgramEntity;
import com.iheb.gestion_universite.academic.program.ProgramRepository;
import com.iheb.gestion_universite.academic.speciality.SpecialityEntity;
import com.iheb.gestion_universite.academic.speciality.SpecialityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClassService {

    private final ClassRepository classRepository;
    private final ProgramRepository programRepository;
    private final SpecialityRepository specialityRepository;
    private final AcademicYearRepository academicYearRepository;

    public AcademicClassEntity create(AcademicClassEntity request, Long programId, Long specialityId, Long academicYearId) {
        ProgramEntity program = programRepository.findById(programId)
                .orElseThrow(() -> new RuntimeException("Program not found with id: " + programId));
        SpecialityEntity speciality = specialityRepository.findById(specialityId)
                .orElseThrow(() -> new RuntimeException("Speciality not found with id: " + specialityId));
        AcademicYearEntity academicYear = academicYearRepository.findById(academicYearId)
                .orElseThrow(() -> new RuntimeException("Academic year not found with id: " + academicYearId));

        if (classRepository.existsByLevelAndSessionAndProgramIdAndSpecialityIdAndAcademicYearId(
                request.getLevel(), request.getSession(), programId, specialityId, academicYearId)) {
            throw new RuntimeException("Class already exists for this combination");
        }

        request.setProgram(program);
        request.setSpeciality(speciality);
        request.setAcademicYear(academicYear);
        return classRepository.save(request);
    }

    public AcademicClassEntity getById(Long id) {
        return classRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found with id: " + id));
    }

    public List<AcademicClassEntity> getAll() {
        return classRepository.findAll();
    }

    public AcademicClassEntity update(Long id, AcademicClassEntity request) {
        AcademicClassEntity existing = getById(id);
        existing.setLevel(request.getLevel());
        existing.setSession(request.getSession());
        return classRepository.save(existing);
    }

    public void delete(Long id) {
        AcademicClassEntity existing = getById(id);
        classRepository.delete(existing);
    }
}
