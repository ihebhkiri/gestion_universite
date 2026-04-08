package com.iheb.gestion_universite.core.exceptions;

public class RefreshTokenNotFoundException extends RuntimeException {

    public RefreshTokenNotFoundException (String message) {

        super(message);
    }
}
