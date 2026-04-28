import {FormControl} from '@angular/forms';

export interface StudentResponse {
  id: number;
  firstName: string;
  lastName: string;
  gender: string;
  cin: string;
  phone: string;
  email: string;
  profileImage: string;
  activeGroup: string;
  status: string;
  enrollmentDate: string;
  createdAt: string;
  updatedAt: string;
  programName?: string;
  academicYear?: string;
  classCode?: string;
  yearAverage?: number;
  semester1Passed?: boolean;
  semester2Passed?: boolean;
  selectedSemesterAverage?: number;
}

export interface StudentStatsResponse {
  totalStudents: number;
  activeEnrollments: number;
  newThisMonth: number;
  totalGroups: number;
}

export interface AddStudentRequest {
  email?: string;
  password?: string;
  role?: string;
  cin?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  phone?: string;
}

export interface UpdateStudentRequest {
  cin?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  phone?: string;
}

export interface PageableResponse<T> {
  content: T[];
  pageable: any;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: any;
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
export interface StudentFilterForm {
  search: FormControl<string>;
  academicYear: FormControl<string>;
  program: FormControl<string>;
  status: FormControl<string>;
}
