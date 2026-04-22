export type SemesterStatus = 'PLANNED' | 'REGISTRATION_OPEN' | 'IN_PROGRESS' | 'EXAMS' | 'CLOSED';

export interface SemesterResponse {
  id: number;
  name: string;
  academicYearId: number;
  academicYearLabel: string;
  startDate: string;
  endDate: string;
  status: SemesterStatus;
  examStartDate: string | null;
  examEndDate: string | null;
  description: string | null;
}

export interface AddSemesterRequest {
  name: string;
  academicYearId: number;
  startDate: string;
  endDate: string;
  status: SemesterStatus;
  examStartDate: string | null;
  examEndDate: string | null;
  description: string | null;
}

export interface SemesterStatsResponse {
  totalSemesters: number;
  planned: number;
  registrationOpen: number;
  inProgress: number;
  exams: number;
  closed: number;
}

export interface AcademicYearOption {
  id: number;
  label: string;
  active: boolean;
}

