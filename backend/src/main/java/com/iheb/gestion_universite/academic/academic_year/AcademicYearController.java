package com.iheb.gestion_universite.academic.academic_year;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/academic-years")
public class AcademicYearController {

    private final AcademicYearService academicYearService;

    @PostMapping
    public ResponseEntity<AcademicYearEntity> create(@RequestBody AcademicYearEntity request) {
        return ResponseEntity.ok(academicYearService.create(request));
    }

    @GetMapping
    public ResponseEntity<List<AcademicYearEntity>> getAll() {
        return ResponseEntity.ok(academicYearService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AcademicYearEntity> getById(@PathVariable Long id) {
        return ResponseEntity.ok(academicYearService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AcademicYearEntity> update(@PathVariable Long id, @RequestBody AcademicYearEntity request) {
        return ResponseEntity.ok(academicYearService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        academicYearService.delete(id);
        return ResponseEntity.ok().build();
    }
}
