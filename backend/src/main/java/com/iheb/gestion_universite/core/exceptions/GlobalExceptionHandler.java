package com.iheb.gestion_universite.core.exceptions;


import com.iheb.gestion_universite.attendance.exception.AttendanceAlreadyStartedException;
import com.iheb.gestion_universite.evaluation.exam.ExamConflictException;
import com.iheb.gestion_universite.teaching.timetable.TimetableConflictException;
import com.iheb.gestion_universite.teaching.room.RoomAlreadyExistsException;
import com.iheb.gestion_universite.teaching.room.RoomNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler ({UserNotFoundException.class, TeacherNotFoundException.class, RefreshTokenNotFoundException.class, ExamNotFoundException.class, StudentNotFoundException.class, RoleNotFoundException.class, RoomNotFoundException.class})
    public ResponseEntity<?> handleNotFound (RuntimeException ex) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(ex.getMessage());
    }


    @ExceptionHandler ({
            InvalidTokenException.class,
            InvalidRefreshTokenException.class
    })
    public ResponseEntity<?> handleInvalidToken (RuntimeException ex) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ex.getMessage());
    }


    @ExceptionHandler ({
            TokenExpiredException.class,
            RefreshTokenExpiredException.class
    })
    public ResponseEntity<?> handleExpiredToken (RuntimeException ex) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(ex.getMessage());
    }

    @ExceptionHandler (BadCredentialsException.class)
    public ResponseEntity<?> handleBadCredentials (BadCredentialsException ex) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("Email or password incorrect");
    }

    @ExceptionHandler (DisabledException.class)
    public ResponseEntity<?> handleDisabled (DisabledException ex) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body("Account disabled");
    }

    @ExceptionHandler (LockedException.class)
    public ResponseEntity<?> handleLocked (LockedException ex) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body("Account locked");
    }

    @ExceptionHandler (AccountExpiredException.class)
    public ResponseEntity<?> handleAccountExpired (AccountExpiredException ex) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body("Account expired");
    }

    @ExceptionHandler (CredentialsExpiredException.class)
    public ResponseEntity<?> handleCredentialsExpired (CredentialsExpiredException ex) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body("Password expired");
    }

    @ExceptionHandler ({ExamAlreadyExistsException.class, GradeAlreadyExistsException.class, UserAlreadyExistsException.class, TimetableConflictException.class, RoomAlreadyExistsException.class, AttendanceAlreadyStartedException.class, ExamConflictException.class})
    public ResponseEntity<?> handleAlreadyExists (RuntimeException ex) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ex.getMessage());
    }

    @ExceptionHandler (PasswordMismatchException.class)
    public ResponseEntity<?> handlePasswordMismatch (PasswordMismatchException ex) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ex.getMessage());
    }

    @ExceptionHandler (IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument (IllegalArgumentException ex) {

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ex.getMessage());
    }


    @ExceptionHandler (MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationErrors (MethodArgumentNotValidException ex) {

        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(errors);
    }


    @ExceptionHandler (Exception.class)
    public ResponseEntity<?> handleGenericException (Exception ex) {

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Unexpected server error");
    }


}
