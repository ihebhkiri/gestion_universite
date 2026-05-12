import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { StudentTimetableEntry, STUDENT_TIMETABLE_DAYS } from '../models/student-timetable.model';

@Injectable({
  providedIn: 'root',
})
export class StudentTimetableService {
  private readonly http = inject(HttpClient);
  private readonly timetableUrl = `${environment.apiUrl}students/me/timetable`;

  getTodayAgenda(): Observable<StudentTimetableEntry[]> {
    return this.http.get<StudentTimetableEntry[]>(`${this.timetableUrl}/today`).pipe(
      map((entries) => this.sortEntries(entries)),
    );
  }

  getWeeklyTimetable(): Observable<StudentTimetableEntry[]> {
    return this.http.get<StudentTimetableEntry[]>(this.timetableUrl).pipe(
      map((entries) => this.sortEntries(entries)),
    );
  }

  private sortEntries(entries: StudentTimetableEntry[]): StudentTimetableEntry[] {
    return [...entries].sort((a, b) => {
      const dayDelta = this.dayValue(a.dayOfWeek) - this.dayValue(b.dayOfWeek);
      return dayDelta !== 0 ? dayDelta : this.timeValue(a.startTime) - this.timeValue(b.startTime);
    });
  }

  private dayValue(day: string | null | undefined): number {
    const index = STUDENT_TIMETABLE_DAYS.findIndex((item) => item.day === day);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  }

  private timeValue(value: string | null | undefined): number {
    if (!value) {
      return Number.MAX_SAFE_INTEGER;
    }

    const [hours = '0', minutes = '0'] = value.split(':');
    return Number(hours) * 60 + Number(minutes);
  }
}
