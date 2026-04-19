package com.iheb.gestion_universite.student_managment.student.dto;

public record AddStudentRequest(

        String email,
        String password,
        String role,

        String cin ,
        String firstName,
        String lastName,
        String gender ,
        String group ,

        String level,
        String phone

) {}
