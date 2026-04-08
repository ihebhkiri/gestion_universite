package com.iheb.gestion_universite.core.exceptions;

public class GradeAlreadyExistsException extends RuntimeException {

    public GradeAlreadyExistsException (String message) {

        super(message);
    }
}
