package com.iheb.gestion_universite.student_managment.student_payment;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudentPaymentAccountRepository extends JpaRepository<StudentPaymentAccountEntity, Long> {

    Optional<StudentPaymentAccountEntity> findByStudentId(Long studentId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select account from StudentPaymentAccountEntity account where account.student.id = :studentId")
    Optional<StudentPaymentAccountEntity> findWithLockByStudentId(@Param("studentId") Long studentId);

    @Query("""
            select sum(account.totalAmount), sum(account.totalPaid), sum(account.remainingAmount)
            from StudentPaymentAccountEntity account
            """)
    Object[] getPaymentTotals();

    @Query("""
            select
                case
                    when speciality.name is null or speciality.name = '' then 'information non disponible'
                    else speciality.name
                end,
                sum(account.totalAmount),
                sum(account.totalPaid),
                sum(account.remainingAmount)
            from StudentPaymentAccountEntity account
            left join account.enrollment enrollment
            left join enrollment.group studentGroup
            left join studentGroup.academicClass academicClass
            left join academicClass.speciality speciality
            group by
                case
                    when speciality.name is null or speciality.name = '' then 'information non disponible'
                    else speciality.name
                end
            order by
                case
                    when speciality.name is null or speciality.name = '' then 'information non disponible'
                    else speciality.name
                end
            """)
    List<Object[]> getPaymentTotalsBySpeciality();
}
