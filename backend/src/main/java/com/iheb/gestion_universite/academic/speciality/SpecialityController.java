package com.iheb.gestion_universite.academic.speciality;

import com.iheb.gestion_universite.academic.speciality.dto.AddSpecialityRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/")
@RequiredArgsConstructor
public class SpecialityController {

    private final SpecialityService specialityService;

    @PostMapping("/programs/{programId}/specialities")
    public ResponseEntity<?> addSpeciality(@PathVariable Long programId, @RequestBody AddSpecialityRequest request) {
        specialityService.addSpeciality(programId, request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/specialities/{specialityId}")
    public ResponseEntity<?> updateSpeciality(@PathVariable Long specialityId, @RequestBody AddSpecialityRequest request) {
        specialityService.updateSpeciality(specialityId, request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/specialities/{specialityId}/program/{programId}")
    public ResponseEntity<?> updateSpecialityProgram(@PathVariable Long specialityId, @PathVariable Long programId) {
        specialityService.updateSpecialityProgram(specialityId, programId);
        return ResponseEntity.ok().build();
    }
}
