export type StudentTimetableDay =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY';

export interface StudentTimetableEntry {
  id: number;
  dayOfWeek: StudentTimetableDay | null;
  startTime: string | null;
  endTime: string | null;
  sessionType: string | null;
  courseId: number | null;
  courseCode: string | null;
  courseTitle: string | null;
  teacherId: number | null;
  teacherName: string | null;
  roomId: number | null;
  roomCode: string | null;
  roomName: string | null;
  academicClassId: number | null;
  academicClassCode: string | null;
  semesterId: number | null;
  semesterName: string | null;
}

export interface StudentTimetableDayGroup {
  day: StudentTimetableDay;
  label: string;
  entries: StudentTimetableEntry[];
}

export const STUDENT_TIMETABLE_DAYS: Array<{ day: StudentTimetableDay; label: string }> = [
  { day: 'MONDAY', label: 'Monday' },
  { day: 'TUESDAY', label: 'Tuesday' },
  { day: 'WEDNESDAY', label: 'Wednesday' },
  { day: 'THURSDAY', label: 'Thursday' },
  { day: 'FRIDAY', label: 'Friday' },
  { day: 'SATURDAY', label: 'Saturday' },
  { day: 'SUNDAY', label: 'Sunday' },
];
