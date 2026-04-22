export interface ProgramResponse {
  id: number;
  code: string;
  name: string;
  departmentName: string;
  departmentCode: string;
  departmentId: number;
  specialityCount: number;
}

export interface ProgramStatsResponse {
  totalPrograms: number;
  totalDepartments: number;
  totalSpecialities: number;
}

export interface AddProgramRequest {
  code: string;
  name: string;
}

export interface DepartmentOption {
  id: number;
  code: string;
  name: string;
}
