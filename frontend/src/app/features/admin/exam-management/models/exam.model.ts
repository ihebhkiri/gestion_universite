import {FormControl} from '@angular/forms';

export type ExamType = 'PROJECT' | 'EXAM' | 'DS' | 'TP' | 'ORAL';
export type ExamStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ExamSessionType = 'MAIN' | 'RESIT';
export type ExamConflictType = 'ROOM' | 'SUPERVISOR' | 'CLASS' | 'GROUP' | 'COURSE' | 'TIME';

export interface ExamResponse {
  id: number;
  title: string;
  type: ExamType;
  sessionType: ExamSessionType | null;
  status: ExamStatus;
  duration: number | null;
  weight: number | null;
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

export interface ExamRequest {
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

export interface ExamStatusRequest {
  status: ExamStatus;
}

export interface ExamFilters {
  academicYearId: string;
  semesterId: string;
  courseId: string;
  classId: string;
  groupId: string;
  roomId: string;
  supervisorId: string;
  date: string;
  status: ExamStatus | '';
}

export interface ExamFilterForm {
  academicYearId: FormControl<string>;
  semesterId: FormControl<string>;
  courseId: FormControl<string>;
  classId: FormControl<string>;
  groupId: FormControl<string>;
  roomId: FormControl<string>;
  supervisorId: FormControl<string>;
  date: FormControl<string>;
  status: FormControl<ExamStatus | ''>;
}

export interface ExamDialogForm {
  id: FormControl<number | null>;
  title: FormControl<string>;
  courseId: FormControl<string>;
  classId: FormControl<string>;
  groupId: FormControl<string>;
  roomId: FormControl<string>;
  supervisorId: FormControl<string>;
  semesterId: FormControl<string>;
  examDate: FormControl<string>;
  startTime: FormControl<string>;
  endTime: FormControl<string>;
  type: FormControl<ExamType>;
  sessionType: FormControl<ExamSessionType | ''>;
  status: FormControl<ExamStatus>;
  duration: FormControl<number | null>;
  weight: FormControl<number | null>;
  instructions: FormControl<string>;
}

export interface ExamOption {
  id: number;
  label: string;
  meta?: string;
}

export interface ExamSummary {
  totalExams: number;
  upcomingExams: number;
  todayExams: number;
  usedRooms: number;
  plannedExams: number;
  inProgressExams: number;
  completedExams: number;
  cancelledExams: number;
  conflicts: number;
}

export interface ExamConflict {
  conflictType: ExamConflictType | string;
  message: string;
  examId: number | null;
  examTitle: string | null;
}

export interface ExamConflictCheckRequest {
  examId?: number | null;
  examDate: string;
  startTime: string;
  endTime: string;
  roomId?: number | null;
  classId?: number | null;
  groupId?: number | null;
  supervisorId?: number | null;
}

export interface ExamState {
  exams: ExamResponse[];
  selectedExam: ExamResponse | null;
  selectedDate: string | null;
  summary: ExamSummary | null;
  conflicts: ExamConflict[];
  selectedFilters: ExamFilters;
  localLoading: boolean;
}

export const EXAM_TYPES: {value: ExamType; label: string}[] = [
  {value: 'EXAM', label: 'Exam'},
  {value: 'DS', label: 'DS'},
  {value: 'TP', label: 'TP'},
  {value: 'PROJECT', label: 'Project'},
  {value: 'ORAL', label: 'Oral'}
];

export const EXAM_STATUSES: {value: ExamStatus; label: string}[] = [
  {value: 'PLANNED', label: 'Planned'},
  {value: 'IN_PROGRESS', label: 'In progress'},
  {value: 'COMPLETED', label: 'Completed'},
  {value: 'CANCELLED', label: 'Cancelled'}
];

export const EXAM_SESSION_TYPES: {value: ExamSessionType; label: string}[] = [
  {value: 'MAIN', label: 'Main'},
  {value: 'RESIT', label: 'Resit'}
];
