package com.iheb.gestion_universite.student_managment.student.dto;

public record UpdateStudentRequest(

        String cin,
        String firstName,
        String lastName,
        String gender,

        String group,
        String department,
        String speciality,
        String level,

        String phone

) {
}