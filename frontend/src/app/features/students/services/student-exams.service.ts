import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { SKIP_GLOBAL_LOADER } from '../../../core/constant/loader-context';
import { environment } from '../../../../environments/environment';
import { StudentExam } from '../models/student-exam.model';

export type StudentExamTimelineState = 'upcoming' | 'today' | 'past' | 'unscheduled';

@Injectable({
  providedIn: 'root',
})
export class StudentExamsService {
  private readonly http = inject(HttpClient);
  private readonly examsUrl = `${environment.apiUrl}students/me/exams`;
  private readonly localLoaderContext = new HttpContext().set(SKIP_GLOBAL_LOADER, true);

  getMyExams(): Observable<StudentExam[]> {
    return this.http.get<StudentExam[]>(this.examsUrl, {
      context: this.localLoaderContext,
    }).pipe(
      map((exams) => this.sortChronologically(exams)),
    );
  }

  getUpcomingExamsPreview(limit = 4): Observable<StudentExam[]> {
    return this.getMyExams().pipe(
      map((exams) => exams
        .filter((exam) => {
          const state = this.examTimelineState(exam);
          return state === 'upcoming' || state === 'today';
        })
        .slice(0, limit)),
    );
  }

  sortChronologically(exams: StudentExam[]): StudentExam[] {
    return [...exams].sort((left, right) => this.examDateTimeValue(left) - this.examDateTimeValue(right));
  }

  examTimelineState(exam: StudentExam): StudentExamTimelineState {
    if (!exam.examDate) {
      return 'unscheduled';
    }

    if (exam.status === 'CANCELLED' || exam.status === 'COMPLETED') {
      return 'past';
    }

    const todayKey = this.dateKey(new Date());

    if (exam.examDate === todayKey) {
      if (!exam.startTime) {
        return 'today';
      }

      return this.examDateTimeValue(exam) >= Date.now() ? 'today' : 'past';
    }

    return exam.examDate > todayKey ? 'upcoming' : 'past';
  }

  examDateTimeValue(exam: StudentExam): number {
    if (!exam.examDate) {
      return Number.MAX_SAFE_INTEGER;
    }

    const time = exam.startTime || '00:00';
    const value = new Date(`${exam.examDate}T${time}`).getTime();
    return Number.isNaN(value) ? Number.MAX_SAFE_INTEGER : value;
  }

  private dateKey(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
