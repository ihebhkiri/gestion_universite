import {Injectable} from '@angular/core';
import {BehaviorSubject, distinctUntilChanged, map} from 'rxjs';
import {
  Exam,
  GradeManagementState,
  GradeRecord,
  GradeStats
} from '../models/grade-management.model';

const INITIAL_STATE: GradeManagementState = {
  exams: [],
  currentExam: null,
  gradeRecords: [],
  stats: null,
  selectedCourseId: null,
  localLoading: false
};

@Injectable()
export class GradeManagementStateService {
  private readonly stateSubject = new BehaviorSubject<GradeManagementState>(INITIAL_STATE);

  readonly state$ = this.stateSubject.asObservable();
  readonly exams$ = this.select(state => state.exams);
  readonly currentExam$ = this.select(state => state.currentExam);
  readonly gradeRecords$ = this.select(state => state.gradeRecords);
  readonly stats$ = this.select(state => state.stats);
  readonly selectedCourseId$ = this.select(state => state.selectedCourseId);
  readonly localLoading$ = this.select(state => state.localLoading);

  setExams(exams: Exam[]): void {
    this.patch({exams});
  }

  setCurrentExam(currentExam: Exam | null): void {
    this.patch({currentExam});
  }

  setGradeRecords(gradeRecords: GradeRecord[]): void {
    this.patch({gradeRecords});
  }

  setStats(stats: GradeStats | null): void {
    this.patch({stats});
  }

  setSelectedCourseId(selectedCourseId: number | null): void {
    this.patch({selectedCourseId});
  }

  setLocalLoading(localLoading: boolean): void {
    this.patch({localLoading});
  }

  upsertExam(exam: Exam): void {
    const exams = this.stateSubject.value.exams;
    const exists = exams.some(item => item.id === exam.id);
    this.patch({
      currentExam: exam,
      exams: exists
        ? exams.map(item => item.id === exam.id ? exam : item)
        : [exam, ...exams]
    });
  }

  upsertGradeRecord(record: GradeRecord): void {
    const records = this.stateSubject.value.gradeRecords;
    const exists = records.some(item => item.id === record.id);
    this.patch({
      gradeRecords: exists
        ? records.map(item => item.id === record.id ? record : item)
        : [record, ...records]
    });
  }

  clearExamDetails(): void {
    this.patch({
      currentExam: null,
      gradeRecords: [],
      stats: null
    });
  }

  get snapshot(): GradeManagementState {
    return this.stateSubject.value;
  }

  private patch(partial: Partial<GradeManagementState>): void {
    this.stateSubject.next({...this.stateSubject.value, ...partial});
  }

  private select<T>(selector: (state: GradeManagementState) => T) {
    return this.state$.pipe(
      map(selector),
      distinctUntilChanged()
    );
  }
}
