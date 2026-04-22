export interface CourseResponse {
  id: number;
  code: string;
  title: string;
  credits: number;
  hours: number;
  subjectId: number;
  subjectName: string;
}

export interface AddCourseRequest {
  code: string;
  title: string;
  credits: number;
  hours: number;
  subjectId: number | null;
}

export interface CourseStatsResponse {
  totalCourses: number;
  averageCredits: number;
  totalHours: number;
}

export interface BulkDeleteCoursesRequest {
  courseIds: number[];
}

