export type StudentPaymentStatus = 'PAID' | 'PARTIAL' | 'PENDING' | 'OVERDUE' | string;

export interface StudentPayment {
  id: number;
  label: string;
  amountDue: number;
  amountPaid: number;
  remainingAmount: number;
  currency?: string | null;
  status: StudentPaymentStatus;
  paidAt?: string | null;
  paymentMethod?: string | null;
  receiptNumber?: string | null;
  receiptAvailable?: boolean;
}

export interface StudentPaymentSummary {
  totalDue: number;
  totalPaid: number;
  totalRemaining: number;
  currency?: string | null;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
}

export interface StudentPaymentQueryParams {
  page: number;
  size: number;
  status?: string;
  fromDate?: string | null;
  toDate?: string | null;
  sort?: string;
}
