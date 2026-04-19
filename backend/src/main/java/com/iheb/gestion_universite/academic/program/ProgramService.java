package com.iheb.gestion_universite.academic.program;

import com.iheb.gestion_universite.academic.department.DepartmentEntity;
import com.iheb.gestion_universite.academic.department.DepartmentRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProgramService {

    private final ProgramRepository programRepository;
    private final DepartmentRepo departmentRepo;

    public ProgramEntity create(Long departmentId, ProgramEntity request) {
        if (programRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Program code already exists: " + request.getCode());
        }
        DepartmentEntity department = departmentRepo.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + departmentId));
        request.setDepartment(department);
        return programRepository.save(request);
    }

    public ProgramEntity getById(Long id) {
        return programRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Program not found with id: " + id));
    }

    public List<ProgramEntity> getAll() {
        return programRepository.findAll();
    }

    public ProgramEntity update(Long id, ProgramEntity request) {
        ProgramEntity existing = getById(id);
        existing.setCode(request.getCode());
        existing.setName(request.getName());
        return programRepository.save(existing);
    }

    public void delete(Long id) {
        ProgramEntity existing = getById(id);
        programRepository.delete(existing);
    }
}
