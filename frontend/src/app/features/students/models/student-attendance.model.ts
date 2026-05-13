export type StudentAttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | string;

export interface StudentAttendance {
  id: number;
  courseId?: number | null;
  courseCode?: string | null;
  courseName?: string | null;
  subjectId?: number | null;
  subjectName?: string | null;
  teacherId?: number | null;
  teacherName?: string | null;
  sessionDate: string;
  startTime?: string | null;
  endTime?: string | null;
  room?: string | null;
  status: StudentAttendanceStatus;
  period?: string | null;
  justified?: boolean | null;
  justificationStatus?: string | null;
  recordedAt?: string | null;
}

export interface StudentAttendanceQueryParams {
  page: number;
  size: number;
  status?: string;
  excludeStatus?: string;
  period?: string;
  subjectId?: number | null;
  teacherId?: number | null;
  fromDate?: string | null;
  toDate?: string | null;
  sort?: string;
}

export interface StudentAttendanceSummary {
  presentCount: number;
  absentCount: number;
  lateCount: number;
  justifiedCount: number;
  attendanceRate?: number | null;
}

export interface StudentTopAbsence {
  subjectId?: number | null;
  subjectName: string;
  absenceCount: number;
}

export interface StudentAttendanceFilterOption {
  id: number;
  label: string;
}
