package com.iheb.gestion_universite.student_managment.student_enrollment;

import com.iheb.gestion_universite.student_managment.student_enrollment.dto.ChangeEnrollmentStatusRequest;
import com.iheb.gestion_universite.student_managment.student_enrollment.dto.BulkChangeEnrollmentStatusRequest;
import com.iheb.gestion_universite.student_managment.student_enrollment.dto.EnrollStudentRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin")
public class EnrollmentAdminController {

    private final EnrollmentAdminService enrollmentAdminService;

    @PostMapping("/groups/{groupId}/enrollments")
    public ResponseEntity<?> enrollStudentToGroup(@PathVariable Long groupId, @Valid @RequestBody EnrollStudentRequest request) {
        var enrollment = enrollmentAdminService.enrollStudentToGroup(groupId,request);
        return ResponseEntity.ok(enrollment);

    }
    @PostMapping("/enrollments/{enrollmentId}/status")
    public ResponseEntity <?> changeEnrollmentStatus(@PathVariable Long enrollmentId, @Valid @RequestBody ChangeEnrollmentStatusRequest request) {
        enrollmentAdminService.changeEnrollmentStatus(enrollmentId,request.newStatus());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/enrollments/status/bulk")
    public ResponseEntity<?> bulkChangeEnrollmentStatus(@Valid @RequestBody BulkChangeEnrollmentStatusRequest request) {
        enrollmentAdminService.changeEnrollmentStatusBulk(request.studentIds(), request.newStatus());
        return ResponseEntity.ok().build();
    }

}
