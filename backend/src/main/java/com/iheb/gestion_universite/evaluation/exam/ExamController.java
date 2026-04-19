package com.iheb.gestion_universite.evaluation.exam;

import com.iheb.gestion_universite.evaluation.exam.dto.AddExamRequest;
import com.iheb.gestion_universite.evaluation.exam.dto.AddExamResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping ("api/v1/teachers")

public class ExamController {

    private final ExamService evaluationService;

    @PostMapping ("/courses/{courseId}/exams")
    public ResponseEntity<AddExamResponse> addExam (@PathVariable Long courseId, @RequestBody AddExamRequest request) {

        var response = evaluationService.createExam(request, courseId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response);


    }

}
