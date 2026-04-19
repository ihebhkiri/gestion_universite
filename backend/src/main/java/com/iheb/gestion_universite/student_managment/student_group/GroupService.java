package com.iheb.gestion_universite.student_managment.student_group;

import com.iheb.gestion_universite.academic.academic_class.AcademicClassEntity;
import com.iheb.gestion_universite.academic.academic_class.ClassRepository;
import com.iheb.gestion_universite.student_managment.student_group.dto.AddGroupRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GroupService {

    private final GroupRepository groupRepository;
    private final ClassRepository classRepository;

    public StudentGroupEntity createGroup(Long classId, AddGroupRequest request) {
        checkIfGroupNameAndClassExists(request.name(), classId);
        AcademicClassEntity academicClassEntity = classRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Class not found with id: " + classId));

        var group = StudentGroupEntity.builder()
                .name(request.name())
                .capacity(request.capacity())
                .academicClass(academicClassEntity)
                .build();

        return groupRepository.save(group);
    }

    public void updateGroup(Long groupId, AddGroupRequest request) {
        var group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        group.setName(request.name());
        group.setCapacity(request.capacity());
        groupRepository.save(group);
    }

    private void checkIfGroupNameAndClassExists(String name, Long classId) {
        if (groupRepository.existsByNameAndAcademicClassId(name, classId)) {
            throw new RuntimeException("Group name already exists for the given class");
        }
    }
}
