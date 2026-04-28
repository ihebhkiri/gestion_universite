export type ClassSession = 'JOUR' | 'SOIR';

export interface AcademicClassResponse {
  id: number;
  code: string;
  level: number;
  session: ClassSession;
  programId: number;
  programCode: string;
  programName: string;
  specialityId: number;
  specialityCode: string;
  specialityName: string;
  academicYearId: number;
  academicYearLabel: string;
}

export interface AddAcademicClassRequest {
  level: number;
  session: ClassSession;
  programId: number;
  specialityId: number;
  academicYearId: number;
}

export interface AcademicClassStatsResponse {
  totalClasses: number;
  totalPrograms: number;
  totalSpecialities: number;
  totalAcademicYears: number;
}

export interface ProgramOption {
  id: number;
  code: string;
  name: string;
}

export interface SpecialityOption {
  id: number;
  code: string;
  name: string;
}

export interface AcademicYearOption {
  id: number;
  label: string;
  active: boolean;
}
