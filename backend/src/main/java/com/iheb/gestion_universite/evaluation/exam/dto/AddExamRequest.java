package com.iheb.gestion_universite.evaluation.exam.dto;

import java.util.List;

public record AddExamRequest(String title,

                             double duration,

                             String type,

                             Double weight,

                             String session,

                             List<Long> teacherIds) {

}
