package com.iheb.gestion_universite.academic.program;

import com.iheb.gestion_universite.academic.department.DepartmentEntity;
import com.iheb.gestion_universite.academic.department.DepartmentRepo;
import com.iheb.gestion_universite.academic.program.dto.AddProgramRequest;
import com.iheb.gestion_universite.academic.program.dto.ProgramDataResponse;
import com.iheb.gestion_universite.academic.program.dto.ProgramStatsResponse;
import com.iheb.gestion_universite.academic.speciality.SpecialityRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProgramService {

    private final ProgramRepository programRepository;
    private final DepartmentRepo departmentRepo;
    private final SpecialityRepository specialityRepository;

    public List<ProgramDataResponse> getAllPrograms() {
        return programRepository.findAll().stream()
                .map(p -> new ProgramDataResponse(
                        p.getId(),
                        p.getCode(),
                        p.getName(),
                        p.getDepartment() != null ? p.getDepartment().getName() : null,
                        p.getDepartment() != null ? p.getDepartment().getCode() : null,
                        p.getDepartment() != null ? p.getDepartment().getId() : null,
                        p.getSpecialities() != null ? p.getSpecialities().size() : 0
                ))
                .toList();
    }

    public ProgramStatsResponse getStats() {
        long totalPrograms = programRepository.count();
        long totalDepartments = departmentRepo.count();
        long totalSpecialities = specialityRepository.count();
        return new ProgramStatsResponse(totalPrograms, totalDepartments, totalSpecialities);
    }

    public ProgramEntity getById(Long id) {
        return programRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Program not found with id: " + id));
    }

    // Keep old getAll for backward compatibility (used by SpecialityService frontend dropdown)
    public List<ProgramEntity> getAll() {
        return programRepository.findAll();
    }

    @Transactional
    public ProgramEntity create(Long departmentId, AddProgramRequest request) {
        if (programRepository.existsByCode(request.code().toUpperCase())) {
            throw new RuntimeException("Program code already exists: " + request.code());
        }
        DepartmentEntity department = departmentRepo.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + departmentId));
        ProgramEntity program = new ProgramEntity();
        program.setCode(request.code().toUpperCase());
        program.setName(request.name());
        program.setDepartment(department);
        return programRepository.save(program);
    }

    @Transactional
    public ProgramEntity update(Long id, AddProgramRequest request) {
        ProgramEntity existing = getById(id);
        existing.setCode(request.code().toUpperCase());
        existing.setName(request.name());
        return programRepository.save(existing);
    }

    @Transactional
    public void updateProgramDepartment(Long programId, Long departmentId) {
        ProgramEntity program = getById(programId);
        DepartmentEntity department = departmentRepo.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + departmentId));
        program.setDepartment(department);
        programRepository.save(program);
    }

    public void delete(Long id) {
        ProgramEntity existing = getById(id);
        programRepository.delete(existing);
    }
}
