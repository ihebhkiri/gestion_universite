package com.iheb.gestion_universite.teaching.teacher.dto;

public record AddTeacherRequest(
            String role ,
            String email,
            String password,

            String firstName,
            String lastName,

            String cin,
            String phone,
            String gender ,

            Long  departmentId,
            String grade,
            Long  specialityId,
            String status
    )
{}
