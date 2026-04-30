package com.iheb.gestion_universite.attendance.exception;

public class AttendanceAlreadyStartedException extends RuntimeException {
    public AttendanceAlreadyStartedException(String message) {
        super(message);
    }
}
