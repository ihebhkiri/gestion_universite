export type ResultStatus = 'PASSED' | 'FAILED' | 'ABSENT' | 'PENDING';
export type ResultSessionStatus = 'DRAFT' | 'VALIDATED' | 'PUBLISHED';

export interface ResultSession {
  id: number;
  examId: number | null;
  examTitle: string | null;
  examType: string | null;
  sessionType: string | null;
  examDate: string | null;
  courseId: number | null;
  courseCode: string | null;
  courseTitle: string | null;
  classId: number | null;
  classCode: string | null;
  groupId: number | null;
  groupName: string | null;
  semesterId: number | null;
  semesterName: string | null;
  academicYearId: number | null;
  academicYearLabel: string | null;
  status: ResultSessionStatus;
  totalRecords: number;
  createdAt: string | null;
  updatedAt: string | null;
  validatedAt: string | null;
  publishedAt: string | null;
}

export interface ResultRecord {
  id: number;
  sessionId: number;
  examId: number | null;
  studentId: number;
  studentMatricule: string | null;
  studentName: string;
  score: number | null;
  maxScore: number | null;
  weightedScore: number | null;
  mention: string | null;
  status: ResultStatus;
  published: boolean;
  comment: string | null;
  gradedAt: string | null;
  updatedAt: string | null;
}

export interface ResultStats {
  totalRecords: number;
  evaluatedCount: number;
  passedCount: number;
  failedCount: number;
  absentCount: number;
  pendingCount: number;
  averageScore: number | null;
  bestScore: number | null;
  successRate: number | null;
}

export interface StudentResultOverview {
  studentId: number;
  matricule: string | null;
  studentName: string;
  totalResults: number;
  passedCount: number;
  failedCount: number;
  averageScore: number | null;
  results: ResultRecord[];
}

export interface ResultSessionDetailsResponse {
  session: ResultSession;
  records: ResultRecord[];
  stats: ResultStats | null;
}

export interface CreateResultSessionPayload {
  examId: number;
}

export interface ResultExamOption {
  id: number;
  label: string;
  meta: string;
  disabled?: boolean;
}

export interface UpdateResultScorePayload {
  score: number | null;
  comment?: string | null;
  status?: ResultStatus;
  mention?: string | null;
}

export interface UpdateResultStatusPayload {
  status: ResultStatus;
  comment?: string | null;
}

export interface ResultFilters {
  search: string;
  status: ResultStatus | '';
  minScore: number | null;
  maxScore: number | null;
}

export interface ResultManagementState {
  sessions: ResultSession[];
  currentSession: ResultSession | null;
  results: ResultRecord[];
  stats: ResultStats | null;
  filters: ResultFilters;
  selectedResult: ResultRecord | null;
  localLoading: boolean;
}

export const EMPTY_RESULT_FILTERS: ResultFilters = {
  search: '',
  status: '',
  minScore: null,
  maxScore: null
};

export const EMPTY_RESULT_STATS: ResultStats = {
  totalRecords: 0,
  evaluatedCount: 0,
  passedCount: 0,
  failedCount: 0,
  absentCount: 0,
  pendingCount: 0,
  averageScore: null,
  bestScore: null,
  successRate: null
};

export const RESULT_STATUS_OPTIONS: {value: ResultStatus; label: string}[] = [
  {value: 'PASSED', label: 'Admis'},
  {value: 'FAILED', label: 'Echec'},
  {value: 'ABSENT', label: 'Absent'},
  {value: 'PENDING', label: 'En attente'}
];

export const RESULT_SESSION_STATUS_OPTIONS: {value: ResultSessionStatus; label: string}[] = [
  {value: 'DRAFT', label: 'Draft'},
  {value: 'VALIDATED', label: 'Validated'},
  {value: 'PUBLISHED', label: 'Published'}
];

export function getResultStatusLabel(status: ResultStatus): string {
  return RESULT_STATUS_OPTIONS.find(option => option.value === status)?.label ?? status;
}

export function getResultSessionStatusLabel(status: ResultSessionStatus): string {
  return RESULT_SESSION_STATUS_OPTIONS.find(option => option.value === status)?.label ?? status;
}
