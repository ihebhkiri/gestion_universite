package com.iheb.gestion_universite.student_managment.student_payment;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@ConfigurationProperties(prefix = "student.payment")
public class StudentPaymentProperties {

    private Amount amount = new Amount();
    private BigDecimal monthlyAmount = new BigDecimal("600");

    public Amount getAmount() {
        return amount;
    }

    public void setAmount(Amount amount) {
        this.amount = amount;
    }

    public BigDecimal getPrepAmount() {
        return amount.getPrep();
    }

    public BigDecimal getIngAmount() {
        return amount.getIng();
    }

    public BigDecimal getMonthlyAmount() {
        return monthlyAmount;
    }

    public void setMonthlyAmount(BigDecimal monthlyAmount) {
        this.monthlyAmount = monthlyAmount;
    }

    public static class Amount {
        private BigDecimal prep = new BigDecimal("8000");
        private BigDecimal ing = new BigDecimal("12000");

        public BigDecimal getPrep() {
            return prep;
        }

        public void setPrep(BigDecimal prep) {
            this.prep = prep;
        }

        public BigDecimal getIng() {
            return ing;
        }

        public void setIng(BigDecimal ing) {
            this.ing = ing;
        }
    }
}
