export type StudentCoursePeriod = 'S1' | 'S2' | '';

export interface StudentCourse {
  id: number;
  courseName: string | null;
  courseCode: string | null;
  teacherName: string | null;
  teacherImageUrl: string | null;
  publishedAt: string | null;
  period: string | null;
  subjectId: number | null;
  subjectName: string | null;
  teacherId: number | null;
  hasAttachments: boolean;
  attachmentCount: number;
}

export interface StudentCourseQueryParams {
  page: number;
  size: number;
  period?: StudentCoursePeriod;
  teacherId?: number | null;
  subjectId?: number | null;
  sort?: string;
}

export interface StudentPage<T> {
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

export interface StudentCourseFilterOption {
  id: number;
  label: string;
}
