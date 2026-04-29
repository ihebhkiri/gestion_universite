package com.iheb.gestion_universite.teaching.timetable;

public class TimetableConflictException extends RuntimeException {
    public TimetableConflictException(String message) {
        super(message);
    }
}
