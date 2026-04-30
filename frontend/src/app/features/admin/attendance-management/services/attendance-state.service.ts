import {Injectable} from '@angular/core';
import {BehaviorSubject, distinctUntilChanged, map} from 'rxjs';
import {
  AttendanceFilters,
  AttendanceRecord,
  AttendanceSession,
  AttendanceState
} from '../models/attendance.model';

const INITIAL_STATE: AttendanceState = {
  sessions: [],
  currentSession: null,
  records: [],
  selectedFilters: {
    classId: '',
    courseId: ''
  },
  localLoading: false
};

@Injectable()
export class AttendanceStateService {
  private readonly stateSubject = new BehaviorSubject<AttendanceState>(INITIAL_STATE);

  readonly state$ = this.stateSubject.asObservable();
  readonly sessions$ = this.select(state => state.sessions);
  readonly currentSession$ = this.select(state => state.currentSession);
  readonly records$ = this.select(state => state.records);
  readonly filters$ = this.select(state => state.selectedFilters);
  readonly localLoading$ = this.select(state => state.localLoading);

  setSessions(sessions: AttendanceSession[]): void {
    this.patch({sessions});
  }

  setCurrentSession(currentSession: AttendanceSession | null): void {
    this.patch({currentSession});
  }

  setRecords(records: AttendanceRecord[]): void {
    this.patch({records});
  }

  setFilters(selectedFilters: AttendanceFilters): void {
    this.patch({selectedFilters});
  }

  setLocalLoading(localLoading: boolean): void {
    this.patch({localLoading});
  }

  get snapshot(): AttendanceState {
    return this.stateSubject.value;
  }

  applyDetails(session: AttendanceSession, records: AttendanceRecord[]): void {
    const sessions = this.stateSubject.value.sessions;
    const exists = sessions.some(item => item.id === session.id);
    this.patch({
      currentSession: session,
      records,
      sessions: exists
        ? sessions.map(item => item.id === session.id ? session : item)
        : [session, ...sessions]
    });
  }

  private patch(partial: Partial<AttendanceState>): void {
    this.stateSubject.next({...this.stateSubject.value, ...partial});
  }

  private select<T>(selector: (state: AttendanceState) => T) {
    return this.state$.pipe(
      map(selector),
      distinctUntilChanged()
    );
  }
}
