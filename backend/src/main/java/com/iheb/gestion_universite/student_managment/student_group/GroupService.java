package com.iheb.gestion_universite.student_managment.student_group;

import com.iheb.gestion_universite.academic.academic_class.AcademicClassEntity;
import com.iheb.gestion_universite.academic.academic_class.ClassRepository;
import com.iheb.gestion_universite.student_managment.student_enrollment.EnrollmentRepo;
import com.iheb.gestion_universite.student_managment.student_enrollment.EnrollmentStatus;
import com.iheb.gestion_universite.student_managment.student_group.dto.AddGroupRequest;
import com.iheb.gestion_universite.student_managment.student_group.dto.GroupResponse;
import com.iheb.gestion_universite.student_managment.student_group.dto.GroupStatsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final ClassRepository classRepository;
    private final EnrollmentRepo enrollmentRepo;

    public List<GroupResponse> getAllGroups() {
        return groupRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public StudentGroupEntity createGroup(AddGroupRequest request) {
        AcademicClassEntity academicClassEntity = getClassById(request.classId());
        checkIfGroupNameAndClassExists(request.name(), request.classId());

        var group = StudentGroupEntity.builder()
                .name(request.name().toUpperCase())
                .capacity(request.capacity())
                .academicClass(academicClassEntity)
                .build();

        return groupRepository.save(group);
    }

    public void updateGroup(Long groupId, AddGroupRequest request) {
        var group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        AcademicClassEntity academicClassEntity = getClassById(request.classId());
        if (groupRepository.existsByNameAndAcademicClassIdAndIdNot(request.name(), request.classId(), groupId)) {
            throw new RuntimeException("Group name already exists for the given class");
        }
        group.setName(request.name().toUpperCase());
        group.setCapacity(request.capacity());
        group.setAcademicClass(academicClassEntity);
        groupRepository.save(group);
    }

    public void deleteGroup(Long groupId) {
        if (!groupRepository.existsById(groupId)) {
            throw new RuntimeException("Group not found with id: " + groupId);
        }
        groupRepository.deleteById(groupId);
    }

    private void checkIfGroupNameAndClassExists(String name, Long classId) {
        if (groupRepository.existsByNameAndAcademicClassId(name, classId)) {
            throw new RuntimeException("Group name already exists for the given class");
        }
    }

    private GroupResponse mapToResponse(StudentGroupEntity group) {
        Long classId = group.getAcademicClass() != null ? group.getAcademicClass().getId() : null;
        String classCode = group.getAcademicClass() != null ? group.getAcademicClass().getCode() : null;
        long enrolledStudents = enrollmentRepo.countByGroupIdAndStatus(group.getId(), EnrollmentStatus.CONFIRMED);
        long availableSeats = Math.max(0, group.getCapacity() - enrolledStudents);
        return new GroupResponse(
                group.getId(),
                group.getName(),
                group.getCapacity(),
                enrolledStudents,
                availableSeats,
                classId,
                classCode
        );
    }

    public GroupStatsResponse getStats() {
        long totalGroups = groupRepository.count();
        long totalCapacity = groupRepository.findAll()
                .stream()
                .mapToLong(StudentGroupEntity::getCapacity)
                .sum();
        long activeEnrollments = enrollmentRepo.countByStatus(EnrollmentStatus.CONFIRMED);
        return new GroupStatsResponse(totalGroups, totalCapacity, activeEnrollments);
    }

    private AcademicClassEntity getClassById(Long classId) {
        return classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found with id: " + classId));
    }
}
