export interface AcademicYearResponse {
  id: number;
  label: string;
  startDate: string; // ISO date
  endDate: string;   // ISO date
  active: boolean;
}

export interface AddAcademicYearRequest {
  label: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

export interface AcademicYearStatsResponse {
  totalAcademicYears: number;
  activeAcademicYears: number;
}

