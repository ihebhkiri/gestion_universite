export interface Department {
  id: number;
  name: string;
  code: string;
}

export interface UserLite {
  id: number;
  email: string;
}

export interface Teacher {
  id: number;
  matricule: string;
  firstName: string;
  lastName: string;
  gender: string;
  cin: string;
  phone: string;
  grade: string;
  hireDate: string;
  department: Department;
  user: UserLite;
  createdAt: string;
}

export interface Subject {
  id: number;
  subjectName: string;
  coefficient?: number | null;
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
}

export interface UpdateTeacherRequest {
  id?: number;
  firstName: string;
  lastName: string;
  gender: string;
  cin: string;
  phone: string;
  grade: string;
  departmentId: number;
  specialityId: number | null;
}

export interface AddSubjectRequest {
  subjectName: string;
}
