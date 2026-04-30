export type AttendanceSessionStatus = 'OPEN' | 'CLOSED';
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export type AttendanceTimetableDay = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
export type AttendanceCourseSessionType = 'CM' | 'TD' | 'TP';

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
}

export interface AttendanceSession {
  id: number;
  title: string;
  sessionCode: string;
  sessionDate: string;
  startTime: string;
  endTime: string | null;
  status: AttendanceSessionStatus;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  academicClassId: number;
  academicClassCode: string;
  teacherId: number | null;
  teacherName: string | null;
  timetableEntryId: number | null;
  scheduledStartTime: string | null;
  scheduledEndTime: string | null;
  summary: AttendanceSummary;
}

export interface AttendanceRecord {
  id: number;
  studentId: number;
  matricule: string;
  studentName: string;
  groupName: string | null;
  status: AttendanceStatus;
  note: string | null;
  markedAt: string | null;
}

export interface AttendanceSessionDetails {
  session: AttendanceSession;
  records: AttendanceRecord[];
}

export interface AttendanceSlot {
  timetableEntryId: number;
  dayOfWeek: AttendanceTimetableDay;
  startTime: string;
  endTime: string;
  sessionType: AttendanceCourseSessionType;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  academicClassId: number;
  academicClassCode: string;
  teacherId: number | null;
  teacherName: string | null;
  roomId: number | null;
  roomCode: string | null;
  roomName: string | null;
}

export interface StartAttendanceSessionRequest {
  timetableEntryId: number;
  title: string | null;
}

export interface UpdateAttendanceRecordRequest {
  status: AttendanceStatus;
  note?: string | null;
}

export interface AttendanceFilters {
  classId: string;
  courseId: string;
}

export interface AttendanceState {
  sessions: AttendanceSession[];
  currentSession: AttendanceSession | null;
  records: AttendanceRecord[];
  selectedFilters: AttendanceFilters;
  localLoading: boolean;
}
