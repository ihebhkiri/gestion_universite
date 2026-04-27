export interface EnrollStudentRequest {
  studentId: number;
}

export interface ChangeEnrollmentStatusRequest {
  newStatus: string;
}

export interface EnrollmentResponse {
  id: number;
  status: string;
  enrollmentDate: string;
}
