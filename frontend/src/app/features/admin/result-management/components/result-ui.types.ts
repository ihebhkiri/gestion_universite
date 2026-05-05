export type ResultStatus = 'PASSED' | 'FAILED' | 'ABSENT' | 'PENDING' | string;

export interface ResultSessionLike {
  id?: number;
  title?: string | null;
  name?: string | null;
  examTitle?: string | null;
  status?: string | null;
  classCode?: string | null;
  className?: string | null;
  academicClassCode?: string | null;
  academicClassName?: string | null;
  subjectCode?: string | null;
  subjectTitle?: string | null;
  courseCode?: string | null;
  courseTitle?: string | null;
  semesterName?: string | null;
  semesterLabel?: string | null;
  academicYearLabel?: string | null;
  academicYear?: string | null;
  year?: string | number | null;
  passThreshold?: number | null;
}

export interface ResultSessionOptionLike {
  id: number;
  label: string;
  meta?: string | null;
}

export interface ResultExamOptionLike {
  id: number;
  label: string;
  meta?: string | null;
  disabled?: boolean;
}

export interface ResultStudentRecord {
  id?: number;
  resultId?: number;
  studentId?: number;
  studentName?: string | null;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  matricule?: string | null;
  studentMatricule?: string | null;
  cin?: string | null;
  groupName?: string | null;
  classCode?: string | null;
  score?: number | null;
  grade?: number | null;
  finalScore?: number | null;
  average?: number | null;
  maxScore?: number | null;
  weightedScore?: number | null;
  published?: boolean | null;
  status?: ResultStatus | null;
  mention?: string | null;
  comment?: string | null;
  note?: string | null;
}

export interface ResultStatsLike {
  totalStudents?: number | null;
  totalRecords?: number | null;
  total?: number | null;
  passedCount?: number | null;
  admittedCount?: number | null;
  passCount?: number | null;
  failedCount?: number | null;
  failCount?: number | null;
  absentCount?: number | null;
  pendingCount?: number | null;
  notRecordedCount?: number | null;
  classAverage?: number | null;
  averageScore?: number | null;
  bestScore?: number | null;
  maxScore?: number | null;
  successRate?: number | null;
}

export interface ResultFiltersValue {
  search: string;
  status: string;
  mention: string;
  minScore: number | null;
  maxScore: number | null;
}

export interface ResultScoreChangeEvent {
  record: ResultStudentRecord;
  score: number | null;
  comment: string | null;
}

export interface ResultStatusChangeEvent {
  record: ResultStudentRecord;
  status: ResultStatus;
}
