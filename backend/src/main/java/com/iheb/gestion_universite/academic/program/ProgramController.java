package com.iheb.gestion_universite.academic.program;

import com.iheb.gestion_universite.academic.program.dto.AddProgramRequest;
import com.iheb.gestion_universite.academic.program.dto.ProgramDataResponse;
import com.iheb.gestion_universite.academic.program.dto.ProgramStatsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin/programs")
public class ProgramController {

    private final ProgramService programService;

    @GetMapping
    public List<ProgramDataResponse> getAllPrograms() {
        return programService.getAllPrograms();
    }

    @GetMapping("/stats")
    public ProgramStatsResponse getStats() {
        return programService.getStats();
    }

    @GetMapping("/{id}")
    public ProgramEntity getById(@PathVariable Long id) {
        return programService.getById(id);
    }

    @PostMapping("/department/{departmentId}")
    @ResponseStatus(HttpStatus.CREATED)
    public ProgramEntity create(@PathVariable Long departmentId, @RequestBody AddProgramRequest request) {
        return programService.create(departmentId, request);
    }

    @PutMapping("/{id}")
    public ProgramEntity update(@PathVariable Long id, @RequestBody AddProgramRequest request) {
        return programService.update(id, request);
    }

    @PutMapping("/{programId}/department/{departmentId}")
    public void updateProgramDepartment(@PathVariable Long programId, @PathVariable Long departmentId) {
        programService.updateProgramDepartment(programId, departmentId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        programService.delete(id);
    }
}
