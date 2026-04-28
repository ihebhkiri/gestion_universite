package com.iheb.gestion_universite.academic.department;

import com.iheb.gestion_universite.academic.department.dto.AddDepartmentRequest;
import com.iheb.gestion_universite.academic.department.dto.DepartmentDataResponse;
import com.iheb.gestion_universite.academic.department.dto.DepartmentStatsResponse;
import com.iheb.gestion_universite.academic.program.ProgramRepository;
import com.iheb.gestion_universite.academic.speciality.SpecialityRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepo departmentRepository;
    private final ProgramRepository programRepository;
    private final SpecialityRepository specialityRepository;

    @Transactional
    public DepartmentEntity createDepartment(AddDepartmentRequest department) {
        checkIfDepartmentNameExists(department.name());
        if (departmentRepository.existsByCode(department.code().toUpperCase())) {
            throw new RuntimeException("Department code already exists: " + department.code());
        }
        DepartmentEntity departmentEntity = new DepartmentEntity();
        departmentEntity.setCode(department.code().toUpperCase());
        departmentEntity.setName(department.name().toUpperCase());
        return departmentRepository.save(departmentEntity);
    }

    public DepartmentEntity getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));
    }

    public List<DepartmentDataResponse> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(d -> new DepartmentDataResponse(
                        d.getId(),
                        d.getCode(),
                        d.getName(),
                        d.getPrograms() != null ? d.getPrograms().size() : 0
                ))
                .toList();
    }

    @Transactional
    public DepartmentEntity updateDepartment(Long id, AddDepartmentRequest updatedDepartment) {
        DepartmentEntity existingDepartment = getDepartmentById(id);
        existingDepartment.setCode(updatedDepartment.code().toUpperCase());
        existingDepartment.setName(updatedDepartment.name().toUpperCase());
        return departmentRepository.save(existingDepartment);
    }

    public void deleteDepartment(Long id) {
        DepartmentEntity existingDepartment = getDepartmentById(id);
        departmentRepository.delete(existingDepartment);
    }

    public DepartmentStatsResponse getStats() {
        long totalDepartments = departmentRepository.count();
        long totalPrograms = programRepository.count();
        long totalSpecialities = specialityRepository.count();
        return new DepartmentStatsResponse(totalDepartments, totalPrograms, totalSpecialities);
    }

    private void checkIfDepartmentNameExists(String name) {
        if (departmentRepository.existsByName(name.toUpperCase())) {
            throw new RuntimeException("Department name already exists: " + name);
        }
    }
}
