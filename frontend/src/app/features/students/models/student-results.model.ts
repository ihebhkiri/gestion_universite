export interface StudentResultsResponse {
  student: StudentResultProfile | null;
  results: StudentAcademicResult[];
  gradeUnits: StudentGradeUnit[];
  recentGrades: StudentRecentGrade[];
}

export interface StudentResultProfile {
  id: number;
  fullName?: string | null;
  className?: string | null;
  academicYear?: string | null;
}

export interface StudentAcademicResult {
  type: string;
  period?: string | null;
  average?: number | null;
  capturedCredits?: number | null;
  result?: string | null;
  mention?: string | null;
  classRank?: number | null;
  levelRank?: number | null;
}

export interface StudentGradeUnit {
  unitName: string;
  semester?: string | null;
  coefficient?: number | null;
  average?: number | null;
  capturedCredits?: number | null;
  subjects: StudentGradeSubject[];
}

export interface StudentGradeSubject {
  subjectName: string;
  coefficient?: number | null;
  project?: StudentGradeValue;
  exam?: StudentGradeValue;
  homework?: StudentGradeValue;
  practicalWork?: StudentGradeValue;
  average?: number | null;
  capturedCredits?: number | null;
  retake?: StudentGradeValue;
}

export interface StudentRecentGrade {
  id: number;
  courseName?: string | null;
  examType?: string | null;
  grade?: StudentGradeValue;
  scoreOn20?: number | null;
  gradedAt?: string | null;
}

export type StudentGradeValue = number | string | null | undefined;
