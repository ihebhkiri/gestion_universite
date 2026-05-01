import {Injectable} from '@angular/core';
import {BehaviorSubject, distinctUntilChanged, map} from 'rxjs';
import {
  ExamConflict,
  ExamFilters,
  ExamResponse,
  ExamState,
  ExamSummary
} from '../models/exam.model';

export const EMPTY_EXAM_FILTERS: ExamFilters = {
  academicYearId: '',
  semesterId: '',
  courseId: '',
  classId: '',
  groupId: '',
  roomId: '',
  supervisorId: '',
  date: '',
  status: '',
};

const INITIAL_STATE: ExamState = {
  exams: [],
  selectedExam: null,
  selectedDate: null,
  summary: null,
  conflicts: [],
  selectedFilters: EMPTY_EXAM_FILTERS,
  localLoading: false
};

@Injectable()
export class ExamStateService {
  private readonly stateSubject = new BehaviorSubject<ExamState>(INITIAL_STATE);

  readonly state$ = this.stateSubject.asObservable();
  readonly exams$ = this.select(state => state.exams);
  readonly selectedExam$ = this.select(state => state.selectedExam);
  readonly selectedDate$ = this.select(state => state.selectedDate);
  readonly summary$ = this.select(state => state.summary);
  readonly conflicts$ = this.select(state => state.conflicts);
  readonly filters$ = this.select(state => state.selectedFilters);
  readonly localLoading$ = this.select(state => state.localLoading);

  setExams(exams: ExamResponse[]): void {
    this.patch({exams});
  }

  setSelectedExam(selectedExam: ExamResponse | null): void {
    this.patch({selectedExam});
  }

  setSelectedDate(selectedDate: string | null): void {
    this.patch({selectedDate});
  }

  setSummary(summary: ExamSummary | null): void {
    this.patch({summary});
  }

  setConflicts(conflicts: ExamConflict[]): void {
    this.patch({conflicts});
  }

  setFilters(selectedFilters: ExamFilters): void {
    this.patch({selectedFilters});
  }

  setLocalLoading(localLoading: boolean): void {
    this.patch({localLoading});
  }

  upsertExam(exam: ExamResponse): void {
    const exams = this.stateSubject.value.exams;
    const exists = exams.some(item => item.id === exam.id);
    this.patch({
      exams: exists
        ? exams.map(item => item.id === exam.id ? exam : item)
        : [exam, ...exams],
      selectedExam: exam
    });
  }

  get snapshot(): ExamState {
    return this.stateSubject.value;
  }

  private patch(partial: Partial<ExamState>): void {
    this.stateSubject.next({...this.stateSubject.value, ...partial});
  }

  private select<T>(selector: (state: ExamState) => T) {
    return this.state$.pipe(
      map(selector),
      distinctUntilChanged()
    );
  }
}
