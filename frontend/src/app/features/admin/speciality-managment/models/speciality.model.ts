export interface SpecialityResponse {
  id: number;
  code: string;
  name: string;
  programName: string;
  programCode: string;
  programId: number;
}

export interface SpecialityStatsResponse {
  totalSpecialities: number;
  totalPrograms: number;
}

export interface AddSpecialityRequest {
  code: string;
  name: string;
}

export interface ProgramOption {
  id: number;
  code: string;
  name: string;
}
