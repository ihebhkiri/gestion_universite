package com.iheb.gestion_universite.evaluation.grade.controller;

import com.iheb.gestion_universite.evaluation.grade.dtos.AddGradeRequest;
import com.iheb.gestion_universite.evaluation.grade.dtos.AddGradeResponse;
import com.iheb.gestion_universite.evaluation.grade.services.GradesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping ("api/v1/teachers")
public class GradeController {

    private final GradesService gradesService ;


    @PostMapping("/exams/{examId}/grades")
    public ResponseEntity<AddGradeResponse> addGrade (@PathVariable Long examId, @RequestBody AddGradeRequest request) {
        var response =gradesService.createGrade(examId,request);
        return  ResponseEntity.status(HttpStatus.CREATED)
                .body(response);
    }

}
