package com.iheb.gestion_universite.core.exceptions;

public class ExamAlreadyExistsException extends RuntimeException {

    public ExamAlreadyExistsException (String message) {

        super(message);
    }
}
