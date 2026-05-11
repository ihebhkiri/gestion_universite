package com.iheb.gestion_universite.student_managment.student_payment;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface StudentPaymentAccountRepository extends JpaRepository<StudentPaymentAccountEntity, Long> {

    Optional<StudentPaymentAccountEntity> findByStudentId(Long studentId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select account from StudentPaymentAccountEntity account where account.student.id = :studentId")
    Optional<StudentPaymentAccountEntity> findWithLockByStudentId(@Param("studentId") Long studentId);
}
