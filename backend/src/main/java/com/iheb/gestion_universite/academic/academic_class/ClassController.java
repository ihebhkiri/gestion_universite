package com.iheb.gestion_universite.academic.academic_class;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/classes")
public class ClassController {

    private final ClassService classService;

    @PostMapping
    public ResponseEntity<AcademicClassEntity> create(
            @RequestBody AcademicClassEntity request,
            @RequestParam Long programId,
            @RequestParam Long specialityId,
            @RequestParam Long academicYearId) {
        return ResponseEntity.ok(classService.create(request, programId, specialityId, academicYearId));
    }

    @GetMapping
    public ResponseEntity<List<AcademicClassEntity>> getAll() {
        return ResponseEntity.ok(classService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AcademicClassEntity> getById(@PathVariable Long id) {
        return ResponseEntity.ok(classService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AcademicClassEntity> update(@PathVariable Long id, @RequestBody AcademicClassEntity request) {
        return ResponseEntity.ok(classService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        classService.delete(id);
        return ResponseEntity.ok().build();
    }
}
