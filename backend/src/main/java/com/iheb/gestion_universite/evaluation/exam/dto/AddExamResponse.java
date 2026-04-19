package com.iheb.gestion_universite.evaluation.exam.dto;

public record AddExamResponse(String title,

                              Double weight,
                              Double duration ,
                              String type ,
                              Long subjectId) {

}
