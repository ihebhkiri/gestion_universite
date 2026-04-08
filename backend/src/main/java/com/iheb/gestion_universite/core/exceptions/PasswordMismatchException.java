package com.iheb.gestion_universite.core.exceptions;

public class PasswordMismatchException extends RuntimeException {

    public PasswordMismatchException (String message) {

        super(message);
    }
}
