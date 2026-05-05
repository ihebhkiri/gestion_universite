import {Injectable} from '@angular/core';
import {BehaviorSubject, distinctUntilChanged, map} from 'rxjs';
import {
  EMPTY_RESULT_FILTERS,
  ResultFilters,
  ResultManagementState,
  ResultRecord,
  ResultSession,
  ResultStats
} from '../models/result-management.model';

const INITIAL_STATE: ResultManagementState = {
  sessions: [],
  currentSession: null,
  results: [],
  stats: null,
  filters: EMPTY_RESULT_FILTERS,
  selectedResult: null,
  localLoading: false
};

@Injectable()
export class ResultStateService {
  private readonly stateSubject = new BehaviorSubject<ResultManagementState>(INITIAL_STATE);

  readonly state$ = this.stateSubject.asObservable();
  readonly sessions$ = this.select(state => state.sessions);
  readonly currentSession$ = this.select(state => state.currentSession);
  readonly results$ = this.select(state => state.results);
  readonly stats$ = this.select(state => state.stats);
  readonly filters$ = this.select(state => state.filters);
  readonly selectedResult$ = this.select(state => state.selectedResult);
  readonly localLoading$ = this.select(state => state.localLoading);

  setSessions(sessions: ResultSession[]): void {
    this.patch({sessions});
  }

  setCurrentSession(currentSession: ResultSession | null): void {
    this.patch({currentSession});
  }

  setResults(results: ResultRecord[]): void {
    this.patch({results});
  }

  setStats(stats: ResultStats | null): void {
    this.patch({stats});
  }

  setFilters(filters: ResultFilters): void {
    this.patch({filters});
  }

  setSelectedResult(selectedResult: ResultRecord | null): void {
    this.patch({selectedResult});
  }

  setLocalLoading(localLoading: boolean): void {
    this.patch({localLoading});
  }

  upsertSession(session: ResultSession): void {
    const sessions = this.stateSubject.value.sessions;
    const exists = sessions.some(item => item.id === session.id);
    this.patch({
      currentSession: session,
      sessions: exists
        ? sessions.map(item => item.id === session.id ? session : item)
        : [session, ...sessions]
    });
  }

  upsertResult(record: ResultRecord): void {
    const results = this.stateSubject.value.results;
    const exists = results.some(item => item.id === record.id);
    this.patch({
      selectedResult: record,
      results: exists
        ? results.map(item => item.id === record.id ? record : item)
        : [record, ...results]
    });
  }

  applyDetails(session: ResultSession, results: ResultRecord[], stats: ResultStats | null): void {
    this.upsertSession(session);
    this.patch({results, stats});
  }

  clearSessionDetails(): void {
    this.patch({
      currentSession: null,
      results: [],
      stats: null,
      selectedResult: null
    });
  }

  get snapshot(): ResultManagementState {
    return this.stateSubject.value;
  }

  private patch(partial: Partial<ResultManagementState>): void {
    this.stateSubject.next({...this.stateSubject.value, ...partial});
  }

  private select<T>(selector: (state: ResultManagementState) => T) {
    return this.state$.pipe(
      map(selector),
      distinctUntilChanged()
    );
  }
}
