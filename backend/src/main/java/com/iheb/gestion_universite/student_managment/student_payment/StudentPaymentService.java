package com.iheb.gestion_universite.student_managment.student_payment;

import com.iheb.gestion_universite.core.exceptions.StudentNotFoundException;
import com.iheb.gestion_universite.student_managment.student.StudentEntity;
import com.iheb.gestion_universite.student_managment.student.StudentRepository;
import com.iheb.gestion_universite.student_managment.student_enrollment.EnrollmentStatus;
import com.iheb.gestion_universite.student_managment.student_enrollment.StudentEnrollmentEntity;
import com.iheb.gestion_universite.student_managment.student_payment.dto.StudentPaymentHistoryResponse;
import com.iheb.gestion_universite.student_managment.student_payment.dto.StudentPaymentReceiptResult;
import com.iheb.gestion_universite.student_managment.student_payment.dto.StudentPaymentSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentPaymentService {

    private static final String DEFERRED_BLOCKING_REASON = "Le paiement commencera après la diplomation.";

    private final StudentRepository studentRepository;
    private final StudentPaymentAccountRepository accountRepository;
    private final StudentPaymentRepository paymentRepository;
    private final StudentPaymentProperties paymentProperties;
    private final StudentPaymentReceiptPdfService receiptPdfService;

    @Transactional
    public StudentPaymentAccountEntity initializePaymentAccount(StudentEnrollmentEntity enrollment) {
        validateEnrollment(enrollment);

        return accountRepository.findByStudentId(enrollment.getStudent().getId())
                .map(existingAccount -> updateExistingAccountIfUnpaid(existingAccount, enrollment))
                .orElseGet(() -> createPaymentAccount(enrollment));
    }

    @Transactional
    public StudentPaymentSummaryResponse getSummary(Long studentId) {
        StudentPaymentAccountEntity account = getOrCreateAccountForStudent(studentId);
        return toSummary(account);
    }

    @Transactional(readOnly = true)
    public List<StudentPaymentHistoryResponse> getHistory(Long studentId) {
        ensureStudentExists(studentId);
        return paymentRepository.findByStudentIdOrderByPaymentDateDescIdDesc(studentId)
                .stream()
                .map(this::toHistoryResponse)
                .toList();
    }

    @Transactional
    public StudentPaymentReceiptResult registerMonthlyPayment(Long studentId) {
        StudentPaymentAccountEntity account = accountRepository.findWithLockByStudentId(studentId)
                .orElseGet(() -> {
                    getOrCreateAccountForStudent(studentId);
                    return accountRepository.findWithLockByStudentId(studentId)
                            .orElseThrow(() -> new IllegalStateException("Student payment account not found"));
                });

        validatePaymentAllowed(account);

        BigDecimal amount = paymentProperties.getMonthlyAmount().min(account.getRemainingAmount());
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be positive");
        }

        BigDecimal previousRemainingAmount = account.getRemainingAmount();
        BigDecimal newRemainingAmount = previousRemainingAmount.subtract(amount);

        StudentPaymentEntity payment = new StudentPaymentEntity();
        payment.setStudent(account.getStudent());
        payment.setPaymentAccount(account);
        payment.setReceiptNumber("PENDING");
        payment.setPaymentDate(LocalDate.now());
        payment.setAmount(amount);
        payment.setPreviousRemainingAmount(previousRemainingAmount);
        payment.setNewRemainingAmount(newRemainingAmount);
        payment.setPaymentMethod(PaymentMethod.MONTHLY_600_TND);

        StudentPaymentEntity savedPayment = paymentRepository.saveAndFlush(payment);
        savedPayment.setReceiptNumber(receiptNumber(savedPayment.getId()));

        account.setTotalPaid(account.getTotalPaid().add(amount));
        account.setRemainingAmount(newRemainingAmount);
        account.setPaymentStatus(resolvePaymentStatus(account));

        byte[] pdf = receiptPdfService.generateReceipt(savedPayment, account);
        String filename = "recu-paiement-%d-%s.pdf".formatted(studentId, savedPayment.getReceiptNumber());
        return new StudentPaymentReceiptResult(pdf, filename);
    }

    private StudentPaymentAccountEntity getOrCreateAccountForStudent(Long studentId) {
        StudentEntity student = ensureStudentExists(studentId);
        return accountRepository.findByStudentId(studentId)
                .orElseGet(() -> initializePaymentAccount(latestEnrollment(student)));
    }

    private StudentEntity ensureStudentExists(Long studentId) {
        return studentRepository.findById(studentId)
                .orElseThrow(() -> new StudentNotFoundException("Student not found"));
    }

    private StudentEnrollmentEntity latestEnrollment(StudentEntity student) {
        if (student.getEnrollments() == null || student.getEnrollments().isEmpty()) {
            throw new IllegalArgumentException("Student must have an enrollment");
        }

        return student.getEnrollments()
                .stream()
                .max(Comparator.comparing(StudentEnrollmentEntity::getEnrollmentDate,
                                Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(StudentEnrollmentEntity::getId, Comparator.nullsLast(Comparator.naturalOrder())))
                .orElseThrow(() -> new IllegalArgumentException("Student must have an enrollment"));
    }

    private StudentPaymentAccountEntity createPaymentAccount(StudentEnrollmentEntity enrollment) {
        AcademicPath academicPath = resolveAcademicPath(enrollment);
        BigDecimal totalAmount = totalAmountFor(academicPath);

        StudentPaymentAccountEntity account = new StudentPaymentAccountEntity();
        account.setStudent(enrollment.getStudent());
        account.setEnrollment(enrollment);
        account.setAcademicPath(academicPath);
        account.setPaymentPlan(enrollment.getPaymentPlan());
        account.setTotalAmount(totalAmount);
        account.setTotalPaid(BigDecimal.ZERO);
        account.setRemainingAmount(totalAmount);
        account.setPaymentStatus(resolvePaymentStatus(account));
        return accountRepository.save(account);
    }

    private StudentPaymentAccountEntity updateExistingAccountIfUnpaid(
            StudentPaymentAccountEntity account,
            StudentEnrollmentEntity enrollment
    ) {
        if (account.getTotalPaid().compareTo(BigDecimal.ZERO) > 0) {
            return account;
        }

        AcademicPath academicPath = resolveAcademicPath(enrollment);
        BigDecimal totalAmount = totalAmountFor(academicPath);
        account.setEnrollment(enrollment);
        account.setAcademicPath(academicPath);
        account.setPaymentPlan(enrollment.getPaymentPlan());
        account.setTotalAmount(totalAmount);
        account.setRemainingAmount(totalAmount);
        account.setPaymentStatus(resolvePaymentStatus(account));
        return account;
    }

    private void validateEnrollment(StudentEnrollmentEntity enrollment) {
        if (enrollment == null || enrollment.getStudent() == null) {
            throw new IllegalArgumentException("Student must have an enrollment");
        }
        if (enrollment.getPaymentPlan() == null) {
            throw new IllegalArgumentException("Student must have a selected payment plan");
        }
    }

    private AcademicPath resolveAcademicPath(StudentEnrollmentEntity enrollment) {
        String programCode = null;
        if (enrollment.getGroup() != null
                && enrollment.getGroup().getAcademicClass() != null
                && enrollment.getGroup().getAcademicClass().getProgram() != null) {
            programCode = enrollment.getGroup().getAcademicClass().getProgram().getCode();
        }

        if (programCode == null || programCode.isBlank()) {
            throw new IllegalArgumentException("Student must have an academic path");
        }

        String normalizedCode = programCode.trim().toUpperCase();
        if (normalizedCode.contains("PREP") || normalizedCode.contains("PREPA")) {
            return AcademicPath.PREP;
        }
        if (normalizedCode.contains("ING")) {
            return AcademicPath.ING;
        }
        throw new IllegalArgumentException("Student academic path must be PREP or ING");
    }

    private BigDecimal totalAmountFor(AcademicPath academicPath) {
        return switch (academicPath) {
            case PREP -> paymentProperties.getPrepAmount();
            case ING -> paymentProperties.getIngAmount();
        };
    }

    private void validatePaymentAllowed(StudentPaymentAccountEntity account) {
        if (account.getRemainingAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Student payment account is already paid");
        }
        StudentPaymentSummaryResponse summary = toSummary(account);
        if (!summary.paymentAllowed()) {
            throw new IllegalArgumentException(summary.blockingReason());
        }
    }

    private StudentPaymentSummaryResponse toSummary(StudentPaymentAccountEntity account) {
        boolean graduated = isGraduated(account.getEnrollment());
        boolean paid = account.getRemainingAmount().compareTo(BigDecimal.ZERO) <= 0;
        boolean deferredBeforeGraduation = account.getPaymentPlan() == PaymentPlan.DEFERRED_AFTER_GRADUATION && !graduated;
        boolean paymentAllowed = !paid && !deferredBeforeGraduation;
        String blockingReason = deferredBeforeGraduation ? DEFERRED_BLOCKING_REASON : null;

        account.setPaymentStatus(resolvePaymentStatus(account));

        return new StudentPaymentSummaryResponse(
                account.getStudent().getId(),
                fullName(account.getStudent()),
                account.getAcademicPath(),
                account.getPaymentPlan(),
                graduated,
                account.getTotalAmount(),
                account.getTotalPaid(),
                account.getRemainingAmount(),
                account.getPaymentStatus(),
                paymentAllowed,
                blockingReason
        );
    }

    private PaymentStatus resolvePaymentStatus(StudentPaymentAccountEntity account) {
        if (account.getRemainingAmount().compareTo(BigDecimal.ZERO) <= 0) {
            return PaymentStatus.PAID;
        }
        if (account.getPaymentPlan() == PaymentPlan.DEFERRED_AFTER_GRADUATION && !isGraduated(account.getEnrollment())) {
            return PaymentStatus.NOT_STARTED;
        }
        return PaymentStatus.IN_PROGRESS;
    }

    private boolean isGraduated(StudentEnrollmentEntity enrollment) {
        return enrollment != null && enrollment.getStatus() == EnrollmentStatus.COMPLETED;
    }

    private StudentPaymentHistoryResponse toHistoryResponse(StudentPaymentEntity payment) {
        return new StudentPaymentHistoryResponse(
                payment.getId(),
                payment.getReceiptNumber(),
                payment.getPaymentDate(),
                payment.getAmount(),
                payment.getPreviousRemainingAmount(),
                payment.getNewRemainingAmount(),
                payment.getPaymentMethod()
        );
    }

    private String fullName(StudentEntity student) {
        return "%s %s".formatted(
                student.getFirstName() != null ? student.getFirstName() : "",
                student.getLastName() != null ? student.getLastName() : ""
        ).trim();
    }

    private String receiptNumber(Long paymentId) {
        return "REC-%d-%05d".formatted(LocalDate.now().getYear(), paymentId);
    }
}
