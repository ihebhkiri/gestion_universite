package com.iheb.gestion_universite.academic.department;

import com.iheb.gestion_universite.academic.department.dto.AddDepartmentRequest;
import com.iheb.gestion_universite.academic.department.dto.DepartmentDataResponse;
import com.iheb.gestion_universite.academic.department.dto.DepartmentStatsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    public List<DepartmentDataResponse> getAllDepartments() {
        return departmentService.getAllDepartments();
    }

    @GetMapping("/stats")
    public DepartmentStatsResponse getStats() {
        return departmentService.getStats();
    }

    @GetMapping("/{id}")
    public DepartmentEntity getDepartmentById(@PathVariable Long id) {
        return departmentService.getDepartmentById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DepartmentEntity createDepartment(@RequestBody AddDepartmentRequest department) {
        return departmentService.createDepartment(department);
    }

    @PutMapping("/{id}")
    public DepartmentEntity updateDepartment(@PathVariable Long id, @RequestBody AddDepartmentRequest department) {
        return departmentService.updateDepartment(id, department);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDepartmentById(@PathVariable Long id) {
        departmentService.deleteDepartment(id);
    }
}
