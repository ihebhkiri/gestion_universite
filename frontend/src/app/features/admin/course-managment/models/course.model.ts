export interface CourseResponse {
  id: number;
  code: string;
  title: string;
  credits: number;
  hours: number;
  subjectId: number;
  subjectName: string;
  coefficient : number ;
  publishedAt: string | null;
  attachmentCount: number;
  hasAttachments: boolean;
}

export interface AddCourseRequest {
  code: string;
  title: string;
  credits: number;
  hours: number;
  subjectId: number | null;
  coefficient : number ;
}

export interface CourseStatsResponse {
  totalCourses: number;
  averageCredits: number;
  totalHours: number;
}

export interface BulkDeleteCoursesRequest {
  courseIds: number[];
}

