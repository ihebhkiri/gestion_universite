package com.iheb.gestion_universite.academic.speciality;

import com.iheb.gestion_universite.academic.program.ProgramEntity;
import com.iheb.gestion_universite.academic.program.ProgramRepository;
import com.iheb.gestion_universite.academic.speciality.dto.AddSpecialityRequest;
import com.iheb.gestion_universite.academic.speciality.dto.SpecialityDataResponse;
import com.iheb.gestion_universite.academic.speciality.dto.SpecialityStatsResponse;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SpecialityService {

    private final SpecialityRepository specialityRepository;
    private final ProgramRepository programRepository;

    public List<SpecialityDataResponse> getAllSpecialities() {
        return specialityRepository.findAll().stream()
                .map(s -> new SpecialityDataResponse(
                        s.getId(),
                        s.getCode(),
                        s.getName(),
                        s.getProgram() != null ? s.getProgram().getName() : null,
                        s.getProgram() != null ? s.getProgram().getCode() : null,
                        s.getProgram() != null ? s.getProgram().getId() : null
                ))
                .toList();
    }

    public SpecialityStatsResponse getStats() {
        long totalSpecialities = specialityRepository.count();
        long totalPrograms = programRepository.count();
        return new SpecialityStatsResponse(totalSpecialities, totalPrograms);
    }

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

    @Transactional
    public SpecialityEntity updateSpeciality(Long specialityId, AddSpecialityRequest request) {
        SpecialityEntity existingSpeciality = specialityRepository.findById(specialityId)
                .orElseThrow(() -> new RuntimeException("Speciality not found with id: " + specialityId));
        existingSpeciality.setCode(request.code().toUpperCase());
        existingSpeciality.setName(request.name());
        return specialityRepository.save(existingSpeciality);
    }

    @Transactional
    public void updateSpecialityProgram(Long specialityId, Long programId) {
        SpecialityEntity speciality = specialityRepository.findById(specialityId)
                .orElseThrow(() -> new RuntimeException("Speciality not found with id: " + specialityId));
        ProgramEntity program = programRepository.findById(programId)
                .orElseThrow(() -> new RuntimeException("Program not found with id: " + programId));
        speciality.setProgram(program);
        specialityRepository.save(speciality);
    }

    public void deleteSpeciality(Long id) {
        SpecialityEntity speciality = specialityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Speciality not found with id: " + id));
        specialityRepository.delete(speciality);
    }
}
