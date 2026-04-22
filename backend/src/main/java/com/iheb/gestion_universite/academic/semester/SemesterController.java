package com.iheb.gestion_universite.academic.semester;

import com.iheb.gestion_universite.academic.semester.dto.AddSemesterRequest;
import com.iheb.gestion_universite.academic.semester.dto.SemesterDataResponse;
import com.iheb.gestion_universite.academic.semester.dto.SemesterStatsResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/semesters")
public class SemesterController {

    private final SemesterService semesterService;

    @PostMapping
    public ResponseEntity<Void> create(@Valid @RequestBody AddSemesterRequest request) {
        semesterService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping
    public ResponseEntity<List<SemesterDataResponse>> getAll() {
        return ResponseEntity.ok(semesterService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SemesterDataResponse> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(semesterService.getOne(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable Long id, @Valid @RequestBody AddSemesterRequest request) {
        semesterService.update(id, request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        semesterService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<SemesterStatsResponse> getStats() {
        return ResponseEntity.ok(semesterService.getStats());
    }
}

