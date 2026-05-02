export type ExamType = 'PROJECT' | 'EXAM' | 'DS' | 'TP' | 'ORAL';
export type ExamStatus = 'DRAFT' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'PUBLISHED' | 'CANCELLED';
export type ExamSessionType = 'MAIN' | 'RESIT';
export type GradeStatus = 'NOT_GRADED' | 'DRAFT' | 'VALIDATED' | 'PUBLISHED';

export interface Exam {
  id: number;
  title: string;
  type: ExamType;
  sessionType: ExamSessionType | null;
  status: ExamStatus;
  duration: number | null;
  weight: number | null;
  maxScore?: number | null;
  examDate: string | null;
  startTime: string | null;
  endTime: string | null;
  instructions: string | null;
  courseId: number;
  courseCode: string | null;
  courseTitle: string | null;
  classId: number | null;
  classCode: string | null;
  groupId: number | null;
  groupName: string | null;
  roomId: number | null;
  roomCode: string | null;
  roomName: string | null;
  supervisorId: number | null;
  supervisorName: string | null;
  semesterId: number | null;
  semesterName: string | null;
  academicYearLabel: string | null;
  createdAt: string | null;
}

export interface GradeRecord {
  id: number;
  examId: number;
  studentId: number;
  matricule: string | null;
  studentName: string;
  groupName: string | null;
  score: number | null;
  coefficient: number | null;
  status: GradeStatus;
  comment: string | null;
  gradedAt: string | null;
  updatedAt: string | null;
}

export interface GradeStats {
  totalStudents: number;
  gradedCount: number;
  notGradedCount: number;
  draftCount: number;
  validatedCount: number;
  publishedCount: number;
  averageScore: number | null;
  minScore: number | null;
  maxScore: number | null;
  successRate: number | null;
}

export interface GradebookDetailsResponse {
  exam: Exam;
  records: GradeRecord[];
  stats: GradeStats | null;
}

export interface GradeCourseOption {
  id: number;
  label: string;
  meta: string;
}

export interface GradeReferenceOption {
  id: number;
  label: string;
  meta?: string;
}

export interface GradeManagementState {
  exams: Exam[];
  currentExam: Exam | null;
  gradeRecords: GradeRecord[];
  stats: GradeStats | null;
  selectedCourseId: number | null;
  localLoading: boolean;
}

export interface CreateExamPayload {
  title: string;
  courseId: number;
  classId: number;
  groupId?: number | null;
  roomId: number;
  supervisorId: number;
  semesterId: number;
  examDate: string;
  startTime: string;
  endTime: string;
  type: ExamType;
  sessionType?: ExamSessionType | null;
  status?: ExamStatus | null;
  duration?: number | null;
  weight?: number | null;
  instructions?: string | null;
}

export interface UpdateGradePayload {
  score: number | null;
  comment?: string | null;
  status?: GradeStatus;
}

export interface SaveDraftGradeItemPayload {
  recordId?: number | null;
  studentId: number;
  score: number | null;
  comment?: string | null;
  status?: GradeStatus;
}

export interface SaveDraftGradesPayload {
  examId: number;
  grades: SaveDraftGradeItemPayload[];
}

export interface CreateGradePayload {
  studentId: number;
  score: number;
}

export interface CreateGradeResponse {
  gradeId: number;
  studentId: number;
  examId: number;
  type: ExamType | string;
  score: number;
}

export interface SaveDraftGradesResponse {
  records: GradeRecord[];
  stats?: GradeStats | null;
}

export interface ExamStatusPayload {
  status: ExamStatus;
}

export const EMPTY_GRADE_STATS: GradeStats = {
  totalStudents: 0,
  gradedCount: 0,
  notGradedCount: 0,
  draftCount: 0,
  validatedCount: 0,
  publishedCount: 0,
  averageScore: null,
  minScore: null,
  maxScore: null,
  successRate: null
};

export const GRADE_EXAM_TYPES: {value: ExamType; label: string}[] = [
  {value: 'EXAM', label: 'Exam'},
  {value: 'DS', label: 'DS'},
  {value: 'TP', label: 'TP'},
  {value: 'PROJECT', label: 'Project'},
  {value: 'ORAL', label: 'Oral'}
];

export const GRADE_EXAM_SESSION_TYPES: {value: ExamSessionType; label: string}[] = [
  {value: 'MAIN', label: 'Main'},
  {value: 'RESIT', label: 'Resit'}
];

export const GRADE_EXAM_STATUSES: {value: ExamStatus; label: string}[] = [
  {value: 'PLANNED', label: 'Planned'},
  {value: 'IN_PROGRESS', label: 'In progress'},
  {value: 'COMPLETED', label: 'Completed'}
];
