export interface DepartmentResponse {
  id: number;
  code: string;
  name: string;
  programCount: number;
}

export interface DepartmentStatsResponse {
  totalDepartments: number;
  totalPrograms: number;
  totalSpecialities: number;
}

export interface AddDepartmentRequest {
  code: string;
  name: string;
}
export interface UpdateDepartmentRequest {
  id : number
  data : {code: string , name: string}
}
