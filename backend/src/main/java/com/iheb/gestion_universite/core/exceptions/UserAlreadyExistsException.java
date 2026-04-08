package com.iheb.gestion_universite.core.exceptions;

public class UserAlreadyExistsException extends RuntimeException {

    public UserAlreadyExistsException (String message) {

        super(message);
    }
}
