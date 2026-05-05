import {HttpErrorResponse} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  defer,
  distinctUntilChanged,
  finalize,
  map
} from 'rxjs';
import {
  CreateResultSessionPayload,
  EMPTY_RESULT_FILTERS,
  EMPTY_RESULT_STATS,
  ResultExamOption,
  ResultFilters,
  ResultRecord,
  ResultSession,
  ResultSessionDetailsResponse,
  ResultStats,
  ResultStatus,
  UpdateResultScorePayload
} from '../models/result-management.model';
import {ExamApiService} from '../../exam-management/services/exam-api.service';
import {ExamFilters} from '../../exam-management/models/exam.model';
import {ResultApiService} from '../services/result-api.service';
import {ResultStateService} from '../services/result-state.service';

@Injectable()
export class ResultFacade {
  private readonly api = inject(ResultApiService);
  private readonly examApi = inject(ExamApiService);
  private readonly state = inject(ResultStateService);
  private readonly toastr = inject(ToastrService);
  private readonly pendingRequestsSubject = new BehaviorSubject<number>(0);
  private readonly examOptionsSubject = new BehaviorSubject<ResultExamOption[]>([]);

  readonly sessions$ = this.state.sessions$;
  readonly currentSession$ = this.state.currentSession$;
  readonly results$ = this.state.results$;
  readonly stats$ = this.state.stats$;
  readonly filters$ = this.state.filters$;
  readonly selectedResult$ = this.state.selectedResult$;
  readonly examOptions$ = this.examOptionsSubject.asObservable();
  readonly sessionOptions$ = this.sessions$.pipe(
    map(sessions => sessions.map(session => ({
      id: session.id,
      label: session.examTitle ?? `Session #${session.id}`,
      meta: [
        session.courseCode,
        session.classCode,
        session.semesterName,
        session.academicYearLabel,
        session.status
      ].filter(Boolean).join(' - ')
    })))
  );
  readonly localLoading$ = combineLatest([
    this.state.localLoading$,
    this.pendingRequestsSubject.pipe(map(count => count > 0), distinctUntilChanged())
  ]).pipe(map(([stateLoading, pending]) => stateLoading || pending));
  readonly filteredResults$ = combineLatest([
    this.results$,
    this.filters$
  ]).pipe(map(([results, filters]) => this.filterResults(results, filters)));

  loadResultSetup(): void {
    this.loadAvailableExams();
    this.loadSessions();
  }

  loadAvailableExams(): void {
    const emptyFilters: ExamFilters = {
      academicYearId: '',
      semesterId: '',
      courseId: '',
      classId: '',
      groupId: '',
      roomId: '',
      supervisorId: '',
      date: '',
      status: ''
    };

    this.withLocalLoader(() => this.examApi.getExams(emptyFilters)).subscribe({
      next: exams => {
        const usedExamIds = new Set(this.state.snapshot.sessions.map(session => session.examId));
        this.examOptionsSubject.next(exams
          .filter(exam => exam.status !== 'CANCELLED')
          .map(exam => ({
            id: exam.id,
            label: exam.title,
            meta: [
              exam.courseCode,
              exam.classCode,
              exam.semesterName,
              exam.academicYearLabel,
              exam.status
            ].filter(Boolean).join(' - '),
            disabled: usedExamIds.has(exam.id)
          })));
      },
      error: error => this.handleError(error, 'Unable to load exams for result sessions.')
    });
  }

  loadSessions(): void {
    const filters = this.state.snapshot.filters;
    this.withLocalLoader(() => this.api.getSessions(filters)).subscribe({
      next: sessions => {
        this.state.setSessions(sessions);
        this.syncExamOptionAvailability(sessions);
        const currentId = this.state.snapshot.currentSession?.id;
        const currentSession = currentId ? sessions.find(session => session.id === currentId) : null;
        const nextSession = currentSession ?? sessions[0] ?? null;
        if (nextSession) {
          this.loadSessionDetails(nextSession.id);
          return;
        }
        this.state.clearSessionDetails();
      },
      error: error => this.handleError(error, 'Unable to load result sessions.')
    });
  }

  createSession(payload: CreateResultSessionPayload): void {
    this.withLocalLoader(() => this.api.createSession(payload)).subscribe({
      next: session => {
        this.state.upsertSession(session);
        this.syncExamOptionAvailability(this.state.snapshot.sessions);
        this.loadSessionDetails(session.id);
        this.toastr.success('Result session created.');
      },
      error: error => this.handleError(error, 'Unable to create result session.')
    });
  }

  loadSessionDetails(sessionId: number): void {
    this.withLocalLoader(() => this.api.getSessionDetails(sessionId)).subscribe({
      next: details => this.applyDetails(details),
      error: error => this.handleError(error, 'Unable to load result session details.')
    });
  }

  loadResults(sessionId: number): void {
    this.withLocalLoader(() => this.api.getResults(sessionId)).subscribe({
      next: results => {
        this.state.setResults(results);
        this.state.setStats(this.buildStats(results, this.state.snapshot.currentSession));
      },
      error: error => this.handleError(error, 'Unable to load student results.')
    });
  }

  updateStudentScore(recordId: number, payload: UpdateResultScorePayload): void {
    this.withLocalLoader(() => this.api.updateStudentScore(recordId, payload)).subscribe({
      next: record => this.applyRecord(record, 'Student score updated.'),
      error: error => this.handleError(error, 'Unable to update student score.')
    });
  }

  updateStudentStatus(recordId: number, status: ResultStatus): void {
    this.withLocalLoader(() => this.api.updateStudentStatus(recordId, {status})).subscribe({
      next: record => this.applyRecord(record, 'Student result status updated.'),
      error: error => this.handleError(error, 'Unable to update student result status.')
    });
  }

  validateSession(sessionId: number): void {
    this.withLocalLoader(() => this.api.validateSession(sessionId)).subscribe({
      next: details => this.applyDetails(details, 'Result session validated.'),
      error: error => this.handleError(error, 'Unable to validate result session.')
    });
  }

  publishSession(sessionId: number): void {
    this.withLocalLoader(() => this.api.publishSession(sessionId)).subscribe({
      next: details => this.applyDetails(details, 'Result session published.'),
      error: error => this.handleError(error, 'Unable to publish result session.')
    });
  }

  loadStats(sessionId: number): void {
    this.withLocalLoader(() => this.api.getStats(sessionId)).subscribe({
      next: stats => this.state.setStats(stats),
      error: error => this.handleError(error, 'Unable to load result statistics.')
    });
  }

  setFilters(filters: Partial<ResultFilters>): void {
    this.state.setFilters({
      ...this.state.snapshot.filters,
      ...filters
    });
  }

  clearFilters(): void {
    this.state.setFilters(EMPTY_RESULT_FILTERS);
  }

  selectResult(result: ResultRecord | null): void {
    this.state.setSelectedResult(result);
  }

  private applyDetails(details: ResultSessionDetailsResponse, message?: string): void {
    this.state.applyDetails(
      details.session,
      details.records,
      details.stats ?? this.buildStats(details.records, details.session)
    );
    this.syncExamOptionAvailability(this.state.snapshot.sessions);
    if (message) {
      this.toastr.success(message);
    }
  }

  private applyRecord(record: ResultRecord, message: string): void {
    this.state.upsertResult(record);
    const results = this.state.snapshot.results.map(item => item.id === record.id ? record : item);
    this.state.setStats(this.buildStats(results));
    this.toastr.success(message);
  }

  private withLocalLoader<T>(requestFactory: () => Observable<T>): Observable<T> {
    return defer(() => {
      this.pendingRequestsSubject.next(this.pendingRequestsSubject.value + 1);
      this.state.setLocalLoading(true);
      return requestFactory().pipe(
        finalize(() => {
          this.pendingRequestsSubject.next(Math.max(0, this.pendingRequestsSubject.value - 1));
          if (this.pendingRequestsSubject.value === 0) {
            this.state.setLocalLoading(false);
          }
        })
      );
    });
  }

  private filterResults(results: ResultRecord[], filters: ResultFilters): ResultRecord[] {
    const search = filters.search.trim().toLowerCase();

    return results.filter(result => {
      const matchesSearch = !search || [
        result.studentName,
        result.studentMatricule
      ].some(value => value?.toLowerCase().includes(search));
      const matchesStatus = !filters.status || result.status === filters.status;
      const matchesScoreMin = filters.minScore === null || (result.score !== null && result.score >= filters.minScore);
      const matchesScoreMax = filters.maxScore === null || (result.score !== null && result.score <= filters.maxScore);

      return matchesSearch && matchesStatus && matchesScoreMin && matchesScoreMax;
    });
  }

  private buildStats(records: ResultRecord[], session?: ResultSession | null): ResultStats {
    if (records.length === 0) return EMPTY_RESULT_STATS;

    const scores = records
      .map(record => record.score)
      .filter((score): score is number => score !== null && score !== undefined);
    const passedCount = records.filter(record => record.status === 'PASSED').length;
    const failedCount = records.filter(record => record.status === 'FAILED').length;
    const absentCount = records.filter(record => record.status === 'ABSENT').length;

    return {
      totalRecords: records.length,
      evaluatedCount: passedCount + failedCount,
      passedCount,
      failedCount,
      absentCount,
      pendingCount: records.filter(record => record.status === 'PENDING').length,
      averageScore: scores.length ? this.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null,
      bestScore: scores.length ? Math.max(...scores) : null,
      successRate: passedCount + failedCount
        ? this.round((passedCount / (passedCount + failedCount)) * 100)
        : 0
    };
  }

  private syncExamOptionAvailability(sessions: ResultSession[]): void {
    const usedExamIds = new Set(sessions.map(session => session.examId));
    this.examOptionsSubject.next(this.examOptionsSubject.value.map(option => ({
      ...option,
      disabled: usedExamIds.has(option.id)
    })));
  }

  private round(value: number): number {
    return Math.round(value * 100) / 100;
  }

  private handleError(error: unknown, fallback: string): void {
    if (error instanceof HttpErrorResponse && typeof error.error === 'string') {
      this.toastr.error(error.error);
      return;
    }
    this.toastr.error(fallback);
  }
}
