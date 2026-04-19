package com.iheb.gestion_universite.student_managment.student_enrollment;

import com.iheb.gestion_universite.student_managment.student_enrollment.dto.ChangeEnrollmentStatusRequest;
import com.iheb.gestion_universite.student_managment.student_enrollment.dto.EnrollStudentRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin")
public class EnrollmentAdminController {

    private final EnrollmentAdminService enrollmentAdminService;

    @PostMapping("/groups/{groupId}/enrollments")
    public ResponseEntity<?> enrollStudentToGroup(@PathVariable Long groupId,@RequestBody EnrollStudentRequest request) {
        var enrollment = enrollmentAdminService.enrollStudentToGroup(groupId,request);
        return ResponseEntity.ok(enrollment);

    }
    @PostMapping("/enrollments/{enrollmentId}/status")
    public ResponseEntity <?> changeEnrollmentStatus(@PathVariable Long enrollmentId, @RequestBody ChangeEnrollmentStatusRequest request) {
        enrollmentAdminService.changeEnrollmentStatus(enrollmentId,request.newStatus());
        return ResponseEntity.ok().build();
    }

}
