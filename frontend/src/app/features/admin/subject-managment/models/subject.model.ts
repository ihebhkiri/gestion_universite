export interface SubjectResponse {
  id: number;
  subjectName: string;
  coefficient: number;
}

export interface AddSubjectRequest {
  subjectName: string;
  coefficient: number;
}

export interface SubjectStatsResponse {
  totalSubjects: number;
  averageCoefficient: number;
}
