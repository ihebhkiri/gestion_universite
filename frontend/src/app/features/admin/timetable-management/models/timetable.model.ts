import {FormControl} from '@angular/forms';

export type TimetableDay = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';
export type CourseSessionType = 'CM' | 'TD' | 'TP';

export interface TimetableEntryResponse {
  id: number;
  dayOfWeek: TimetableDay;
  startTime: string;
  endTime: string;
  sessionType: CourseSessionType;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  teacherId: number;
  teacherName: string;
  roomId: number;
  roomCode: string;
  roomName: string;
  academicClassId: number;
  academicClassCode: string;
  semesterId: number;
  semesterName: string;
}

export interface TimetableEntryRequest {
  dayOfWeek: TimetableDay;
  startTime: string;
  endTime: string;
  courseId: number;
  teacherId: number;
  roomId: number;
  academicClassId: number;
  semesterId: number;
  sessionType: CourseSessionType;
}

export interface RoomResponse {
  id: number;
  code: string;
  name: string | null;
  capacity: number | null;
  building: string | null;
}

export interface TimetableFilters {
  classId: string;
  semesterId: string;
}

export interface TimetableFilterForm {
  classId: FormControl<string>;
  semesterId: FormControl<string>;
}

export interface TimetableEntryForm {
  id: FormControl<number | null>;
  dayOfWeek: FormControl<TimetableDay>;
  startTime: FormControl<string>;
  endTime: FormControl<string>;
  courseId: FormControl<string>;
  teacherId: FormControl<string>;
  roomId: FormControl<string>;
  academicClassId: FormControl<string>;
  semesterId: FormControl<string>;
  sessionType: FormControl<CourseSessionType>;
}
