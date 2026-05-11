package com.iheb.gestion_universite.student_managment.student_payment;

import com.iheb.gestion_universite.student_managment.student_payment.dto.PaidVsRemainingStats;
import com.iheb.gestion_universite.student_managment.student_payment.dto.PaymentBySpecialityStats;
import com.iheb.gestion_universite.student_managment.student_payment.dto.PaymentEvolutionStats;
import com.iheb.gestion_universite.student_managment.student_payment.dto.PaymentStatisticsResponse;
import com.iheb.gestion_universite.student_managment.student_payment.dto.PaymentSummaryStats;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

@Service
@RequiredArgsConstructor
public class PaymentStatisticsService {

    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);
    private static final String TOTAL_LABEL = "Total";
    private static final String CURRENCY = "TND";
    private static final String MISSING_INFORMATION = "information non disponible";
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM");

    private final StudentPaymentAccountRepository accountRepository;
    private final StudentPaymentRepository paymentRepository;

    @Transactional(readOnly = true)
    public PaymentStatisticsResponse getStatistics() {
        List<StudentPaymentAccountEntity> accounts = accountRepository.findAll();
        List<StudentPaymentEntity> payments = paymentRepository.findAll();

        PaymentSummaryStats summary = toSummary(accounts);
        List<PaidVsRemainingStats> paidVsRemaining = summary.totalAmount().compareTo(BigDecimal.ZERO) > 0
                ? List.of(toPaidVsRemaining(summary))
                : List.of();

        return new PaymentStatisticsResponse(
                summary,
                paidVsRemaining,
                toPaymentsBySpeciality(accounts),
                toPaymentEvolution(payments)
        );
    }

    private PaymentSummaryStats toSummary(List<StudentPaymentAccountEntity> accounts) {
        BigDecimal totalAmount = sum(accounts, StudentPaymentAccountEntity::getTotalAmount);
        BigDecimal totalPaid = sum(accounts, StudentPaymentAccountEntity::getTotalPaid);
        BigDecimal remainingAmount = sum(accounts, StudentPaymentAccountEntity::getRemainingAmount);

        return new PaymentSummaryStats(
                totalAmount,
                totalPaid,
                remainingAmount,
                percentage(totalPaid, totalAmount),
                percentage(remainingAmount, totalAmount),
                CURRENCY
        );
    }

    private PaidVsRemainingStats toPaidVsRemaining(PaymentSummaryStats summary) {
        return new PaidVsRemainingStats(
                TOTAL_LABEL,
                summary.totalPaidAmount(),
                summary.totalRemainingAmount()
        );
    }

    private List<PaymentBySpecialityStats> toPaymentsBySpeciality(List<StudentPaymentAccountEntity> accounts) {
        Map<String, SpecialityTotals> totalsBySpeciality = new LinkedHashMap<>();

        accounts.stream()
                .sorted(Comparator.comparing(this::specialityName))
                .forEach(account -> {
                    SpecialityTotals totals = totalsBySpeciality.computeIfAbsent(
                            specialityName(account),
                            ignored -> new SpecialityTotals()
                    );
                    totals.totalAmount = totals.totalAmount.add(money(account.getTotalAmount()));
                    totals.paidAmount = totals.paidAmount.add(money(account.getTotalPaid()));
                    totals.remainingAmount = totals.remainingAmount.add(money(account.getRemainingAmount()));
                });

        return totalsBySpeciality.entrySet()
                .stream()
                .map(entry -> new PaymentBySpecialityStats(
                        entry.getKey(),
                        entry.getValue().paidAmount,
                        entry.getValue().remainingAmount,
                        entry.getValue().totalAmount
                ))
                .toList();
    }

    private List<PaymentEvolutionStats> toPaymentEvolution(List<StudentPaymentEntity> payments) {
        Map<String, BigDecimal> paidAmountByPeriod = new TreeMap<>();

        payments.forEach(payment -> {
            if (payment.getPaymentDate() == null) {
                return;
            }

            String period = payment.getPaymentDate().format(MONTH_FORMATTER);
            paidAmountByPeriod.merge(period, money(payment.getAmount()), BigDecimal::add);
        });

        return paidAmountByPeriod.entrySet()
                .stream()
                .map(entry -> new PaymentEvolutionStats(entry.getKey(), entry.getValue()))
                .toList();
    }

    private BigDecimal sum(
            List<StudentPaymentAccountEntity> accounts,
            java.util.function.Function<StudentPaymentAccountEntity, BigDecimal> amountExtractor
    ) {
        return accounts.stream()
                .map(amountExtractor)
                .map(this::money)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal money(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    private String specialityName(StudentPaymentAccountEntity account) {
        if (account.getEnrollment() != null
                && account.getEnrollment().getGroup() != null
                && account.getEnrollment().getGroup().getAcademicClass() != null
                && account.getEnrollment().getGroup().getAcademicClass().getSpeciality() != null
                && account.getEnrollment().getGroup().getAcademicClass().getSpeciality().getName() != null
                && !account.getEnrollment().getGroup().getAcademicClass().getSpeciality().getName().isBlank()) {
            return account.getEnrollment().getGroup().getAcademicClass().getSpeciality().getName();
        }

        return MISSING_INFORMATION;
    }

    private BigDecimal percentage(BigDecimal value, BigDecimal total) {
        if (total.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return value.multiply(ONE_HUNDRED).divide(total, 2, RoundingMode.HALF_UP);
    }

    private static class SpecialityTotals {
        private BigDecimal totalAmount = BigDecimal.ZERO;
        private BigDecimal paidAmount = BigDecimal.ZERO;
        private BigDecimal remainingAmount = BigDecimal.ZERO;
    }
}
