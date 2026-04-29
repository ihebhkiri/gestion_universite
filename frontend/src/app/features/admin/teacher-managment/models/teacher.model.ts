import {FormControl} from '@angular/forms';

export type TeacherStatus = 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
export type SortDirection = 'asc' | 'desc';

export interface TeacherResponse {
  id: number;
  matricule: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  cin: string | null;
  phone: string | null;
  gender: string | null;
  grade: string | null;
  status: TeacherStatus;
  hireDate: string | null;
  createdAt: string;
  departmentId: number | null;
  departmentName: string | null;
  specialityId: number | null;
  specialityName: string | null;
  subjects: string[];
  assignedClassesCount: number;
}

export interface TeacherFilters {
  search: string;
  department: string;
  status: string;
  subject: string;
  speciality: string;
  hiredFrom: string;
  hiredTo: string;
}

export interface TeacherFilterForm {
  search: FormControl<string>;
  department: FormControl<string>;
  status: FormControl<string>;
  subject: FormControl<string>;
  speciality: FormControl<string>;
  hiredFrom: FormControl<string>;
  hiredTo: FormControl<string>;
}

export interface TeacherSort {
  active: string;
  direction: SortDirection;
}

export interface AddTeacherRequest {
  role: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  cin: string;
  phone: string;
  gender: string;
  departmentId: number;
  grade: string;
  specialityId: number | null;
  status: TeacherStatus;
}

export interface UpdateTeacherRequest {
  firstName: string;
  lastName: string;
  gender: string;
  cin: string;
  phone: string;
  grade: string;
  departmentId: number;
  specialityId: number | null;
  status: TeacherStatus;
}

export interface AssignTeacherRequest {
  courseId: number;
  semesterId: number;
  classId: number;
}

export interface PageableResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface TeacherForm {
  id: FormControl<number | null>;
  role: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  gender: FormControl<string>;
  cin: FormControl<string>;
  phone: FormControl<string>;
  grade: FormControl<string>;
  departmentId: FormControl<string>;
  specialityId: FormControl<string>;
  status: FormControl<TeacherStatus>;
}

export interface AssignmentForm {
  courseId: FormControl<string>;
  semesterId: FormControl<string>;
  classId: FormControl<string>;
}
