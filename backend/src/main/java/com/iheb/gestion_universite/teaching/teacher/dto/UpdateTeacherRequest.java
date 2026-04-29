package com.iheb.gestion_universite.teaching.teacher.dto;

public record UpdateTeacherRequest(Long id,


                                   String firstName,

                                   String lastName,

                                   String gender,

                                   String cin,

                                   String phone,

                                   String grade,

                                   Long departmentId,

                                   Long specialityId,

                                   String status) {

}
