package com.iheb.gestion_universite.academic.academic_class;

import com.iheb.gestion_universite.academic.academic_class.dto.AcademicClassDataResponse;
import com.iheb.gestion_universite.academic.academic_class.dto.AcademicClassStatsResponse;
import com.iheb.gestion_universite.academic.academic_class.dto.AddAcademicClassRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/classes")
public class ClassController {

    private final ClassService classService;

    @PostMapping
    public ResponseEntity<Void> create(@Valid @RequestBody AddAcademicClassRequest request) {
        classService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping
    public ResponseEntity<List<AcademicClassDataResponse>> getAll() {
        return ResponseEntity.ok(classService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AcademicClassDataResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(classService.getOne(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable Long id, @Valid @RequestBody AddAcademicClassRequest request) {
        classService.update(id, request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        classService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<AcademicClassStatsResponse> getStats() {
        return ResponseEntity.ok(classService.getStats());
    }
}
