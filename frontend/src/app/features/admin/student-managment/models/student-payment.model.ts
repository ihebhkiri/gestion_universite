export type AcademicPath = 'PREP' | 'ING';
export type PaymentPlan = 'MONTHLY_DURING_STUDIES' | 'DEFERRED_AFTER_GRADUATION';
export type PaymentStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'PAID';
export type PaymentMethod = 'MONTHLY_600_TND';

export interface StudentPaymentSummary {
  studentId: number;
  studentFullName: string;
  academicPath: AcademicPath;
  paymentPlan: PaymentPlan;
  graduated: boolean;
  totalAmount: number;
  totalPaid: number;
  remainingAmount: number;
  paymentStatus: PaymentStatus;
  paymentAllowed: boolean;
  blockingReason: string | null;
}

export interface StudentPaymentHistory {
  paymentId: number;
  receiptNumber: string;
  paymentDate: string;
  amount: number;
  previousRemainingAmount: number;
  newRemainingAmount: number;
  paymentMethod: PaymentMethod;
}
