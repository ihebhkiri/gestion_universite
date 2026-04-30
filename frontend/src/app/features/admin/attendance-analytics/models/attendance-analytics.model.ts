export type AttendanceAnalyticsStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export type AttendanceRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AttendanceAnalyticsFilters {
  academicYearId: string;
  semesterId: string;
  classId: string;
  groupId: string;
}

export interface AttendanceAnalyticsSummary {
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  presenceRate: number;
  absenceRate: number;
  lateRate: number;
  excusedRate: number;
}

export interface GroupAttendanceSummary extends AttendanceAnalyticsSummary {
  totalStudents: number;
  totalRecords: number;
}

export interface GroupStudentAttendance {
  studentId: number;
  matricule: string;
  studentName: string;
  groupName: string | null;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  presenceRate: number;
  absenceRate: number;
  riskLevel: AttendanceRiskLevel;
}

export interface CourseAbsenceStat {
  courseId: number;
  courseCode: string;
  courseTitle: string;
  teacherName: string | null;
  totalSessions: number;
  totalRecords: number;
  absentCount: number;
  absenceRate: number;
}

export interface TeacherAbsenceStat {
  teacherId: number;
  teacherName: string;
  totalCourses: number;
  totalSessions: number;
  totalRecords: number;
  absentCount: number;
  absenceRate: number;
}

export interface StudentCourseAttendance {
  courseId: number;
  courseCode: string;
  courseTitle: string;
  teacherName: string | null;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  presenceRate: number;
  absenceRate: number;
}

export interface StudentAttendanceHistory {
  sessionId: number;
  sessionDate: string;
  courseCode: string | null;
  courseTitle: string | null;
  teacherName: string | null;
  status: AttendanceAnalyticsStatus;
  markedAt: string | null;
}

export interface StudentAttendanceProfile {
  studentId: number;
  matricule: string;
  studentName: string;
  groupName: string | null;
  classCode: string | null;
  globalSummary: AttendanceAnalyticsSummary;
  courseSummaries: StudentCourseAttendance[];
  history: StudentAttendanceHistory[];
}

export interface AttendanceAnalyticsState {
  filters: AttendanceAnalyticsFilters;
  groupSummary: GroupAttendanceSummary | null;
  students: GroupStudentAttendance[];
  courseAbsenceRanking: CourseAbsenceStat[];
  teacherAbsenceRanking: TeacherAbsenceStat[];
  selectedStudentProfile: StudentAttendanceProfile | null;
  localLoading: boolean;
}
