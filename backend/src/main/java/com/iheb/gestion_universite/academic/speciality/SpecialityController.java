package com.iheb.gestion_universite.academic.speciality;

import com.iheb.gestion_universite.academic.speciality.dto.AddSpecialityRequest;
import com.iheb.gestion_universite.academic.speciality.dto.SpecialityDataResponse;
import com.iheb.gestion_universite.academic.speciality.dto.SpecialityStatsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/specialities")
@RequiredArgsConstructor
public class SpecialityController {

    private final SpecialityService specialityService;

    @GetMapping
    public List<SpecialityDataResponse> getAllSpecialities() {
        return specialityService.getAllSpecialities();
    }

    @GetMapping("/stats")
    public SpecialityStatsResponse getStats() {
        return specialityService.getStats();
    }

    @PostMapping("/program/{programId}")
    @ResponseStatus(HttpStatus.CREATED)
    public SpecialityEntity addSpeciality(@PathVariable Long programId, @RequestBody AddSpecialityRequest request) {
        return specialityService.addSpeciality(programId, request);
    }

    @PutMapping("/{specialityId}")
    public SpecialityEntity updateSpeciality(@PathVariable Long specialityId, @RequestBody AddSpecialityRequest request) {
        return specialityService.updateSpeciality(specialityId, request);
    }

    @PutMapping("/{specialityId}/program/{programId}")
    public void updateSpecialityProgram(@PathVariable Long specialityId, @PathVariable Long programId) {
        specialityService.updateSpecialityProgram(specialityId, programId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSpeciality(@PathVariable Long id) {
        specialityService.deleteSpeciality(id);
    }
}
