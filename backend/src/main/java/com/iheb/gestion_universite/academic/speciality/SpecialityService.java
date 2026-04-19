package com.iheb.gestion_universite.academic.speciality;

import com.iheb.gestion_universite.academic.program.ProgramEntity;
import com.iheb.gestion_universite.academic.program.ProgramRepository;
import com.iheb.gestion_universite.academic.speciality.dto.AddSpecialityRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SpecialityService {

    private final SpecialityRepository specialityRepository;
    private final ProgramRepository programRepository;

    @Transactional
    public SpecialityEntity addSpeciality(Long programId, AddSpecialityRequest request) {
        if (specialityRepository.existsByCode(request.code().toUpperCase())) {
            throw new RuntimeException("Speciality code already exists: " + request.code());
        }
        ProgramEntity program = programRepository.findById(programId)
                .orElseThrow(() -> new RuntimeException("Program not found with id: " + programId));

        SpecialityEntity speciality = new SpecialityEntity();
        speciality.setCode(request.code().toUpperCase());
        speciality.setName(request.name());
        speciality.setProgram(program);
        return specialityRepository.save(speciality);
    }

    public SpecialityEntity updateSpeciality(Long specialityId, AddSpecialityRequest request) {
        SpecialityEntity existingSpeciality = specialityRepository.findById(specialityId)
                .orElseThrow(() -> new RuntimeException("Speciality not found with id: " + specialityId));
        existingSpeciality.setCode(request.code().toUpperCase());
        existingSpeciality.setName(request.name());
        return specialityRepository.save(existingSpeciality);
    }

    public void updateSpecialityProgram(Long specialityId, Long programId) {
        SpecialityEntity speciality = specialityRepository.findById(specialityId)
                .orElseThrow(() -> new RuntimeException("Speciality not found with id: " + specialityId));
        ProgramEntity program = programRepository.findById(programId)
                .orElseThrow(() -> new RuntimeException("Program not found with id: " + programId));
        speciality.setProgram(program);
        specialityRepository.save(speciality);
    }
}
