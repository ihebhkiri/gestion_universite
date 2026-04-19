package com.iheb.gestion_universite.evaluation.grade.dtos;

import java.time.Instant;

public record AddGradeResponse(Long gradeId,

                               Long studentId,

                               Long examId,

                               String type,

                               Double score

) {

}
