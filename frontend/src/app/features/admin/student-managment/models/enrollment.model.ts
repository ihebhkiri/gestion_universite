export interface EnrollStudentRequest {
  studentId: number;
}

export interface ChangeEnrollmentStatusRequest {
  newStatus: string; // ACTIVE, CANCELLED, COMPLETED
}

export interface EnrollmentResponse {
  id: number;
  status: string;
  enrollmentDate: string;
  // student, group, class omitted for simplicity, can be added if needed
}
