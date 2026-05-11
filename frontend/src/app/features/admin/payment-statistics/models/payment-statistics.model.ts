export interface PaymentSummary {
  totalAmount: number;
  totalPaidAmount: number;
  totalRemainingAmount: number;
  paidPercentage: number;
  remainingPercentage: number;
  currency: string;
}

export interface PaidVsRemainingStat {
  label: string;
  paidAmount: number;
  remainingAmount: number;
}

export interface PaymentBySpecialityStat {
  specialityName: string;
  paidAmount: number;
  remainingAmount: number;
  totalAmount: number;
}

export interface PaymentEvolutionPoint {
  period: string;
  paidAmount: number;
}

export interface PaymentStatisticsResponse {
  summary: PaymentSummary;
  paidVsRemaining: PaidVsRemainingStat[];
  paymentsBySpeciality: PaymentBySpecialityStat[];
  paymentEvolution: PaymentEvolutionPoint[];
}

