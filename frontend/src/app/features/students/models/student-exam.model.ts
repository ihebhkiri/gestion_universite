export type StudentExamType = 'PROJECT' | 'EXAM' | 'DS' | 'TP' | 'ORAL';
export type StudentExamStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type StudentExamSessionType = 'MAIN' | 'RESIT';

export interface StudentExam {
  id: number;
  title: string;
  type: StudentExamType | null;
  sessionType: StudentExamSessionType | null;
  status: StudentExamStatus | null;
  duration: number | null;
  weight: number | null;
  examDate: string | null;
  startTime: string | null;
  endTime: string | null;
  instructions: string | null;
  courseId: number | null;
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
