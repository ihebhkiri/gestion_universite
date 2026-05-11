import {PaymentPlan} from './student-payment.model';

export interface EnrollStudentRequest {
  studentId: number;
  paymentPlan: PaymentPlan;
}

export interface ChangeEnrollmentStatusRequest {
  newStatus: string;
}

export interface EnrollmentResponse {
  id: number;
  status: string;
  enrollmentDate: string;
}
