package com.iheb.gestion_universite.academic.academic_year;

import com.iheb.gestion_universite.academic.academic_year.dto.AcademicYearDataResponse;
import com.iheb.gestion_universite.academic.academic_year.dto.AcademicYearStatsResponse;
import com.iheb.gestion_universite.academic.academic_year.dto.AddAcademicYearRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/academic-years")
public class AcademicYearController {

    private final AcademicYearService academicYearService;

    @PostMapping
    public ResponseEntity<Void> create(@Valid @RequestBody AddAcademicYearRequest request) {
        academicYearService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping
    public ResponseEntity<List<AcademicYearDataResponse>> getAll() {
        return ResponseEntity.ok(academicYearService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AcademicYearDataResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(academicYearService.getOne(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Void> update(@PathVariable Long id, @Valid @RequestBody AddAcademicYearRequest request) {
        academicYearService.update(id, request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        academicYearService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<AcademicYearStatsResponse> getStats() {
        return ResponseEntity.ok(academicYearService.getStats());
    }
}
