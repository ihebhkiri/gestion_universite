package com.iheb.gestion_universite.teaching.teacher.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeacherDTO {
    private Long id;
    private String matricule;
    private String firstName;
    private String lastName;
    private String cin;
    private String phone;
    private String grade;
    private LocalDate hireDate;
    private Long departmentId;
    private Long specialityId;
    private Long userId;
    private Set<Long> teachingAssignmentIds;
    private Instant createdAt;
}
