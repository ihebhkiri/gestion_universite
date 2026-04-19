package com.iheb.gestion_universite.academic.program;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin")
public class ProgramController {

    private final ProgramService programService;

    @PostMapping("/departments/{departmentId}/programs")
    public ResponseEntity<ProgramEntity> create(@PathVariable Long departmentId, @RequestBody ProgramEntity request) {
        return ResponseEntity.ok(programService.create(departmentId, request));
    }

    @GetMapping("/programs")
    public ResponseEntity<List<ProgramEntity>> getAll() {
        return ResponseEntity.ok(programService.getAll());
    }

    @GetMapping("/programs/{id}")
    public ResponseEntity<ProgramEntity> getById(@PathVariable Long id) {
        return ResponseEntity.ok(programService.getById(id));
    }

    @PutMapping("/programs/{id}")
    public ResponseEntity<ProgramEntity> update(@PathVariable Long id, @RequestBody ProgramEntity request) {
        return ResponseEntity.ok(programService.update(id, request));
    }

    @DeleteMapping("/programs/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        programService.delete(id);
        return ResponseEntity.ok().build();
    }
}
