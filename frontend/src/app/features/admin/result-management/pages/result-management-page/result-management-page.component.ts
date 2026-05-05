import {CommonModule} from '@angular/common';
import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {animate, style, transition, trigger} from '@angular/animations';
import {Observable, of} from 'rxjs';
import {take} from 'rxjs/operators';
import {HeaderComponent} from '../../../../../shared/components/admin/header/header.component';
import {SidebarComponent} from '../../../../../shared/components/admin/sidebar/sidebar.component';
import {ResultFacade} from '../../facades/result.facade';
import {ResultStateService} from '../../services/result-state.service';
import {
  ResultFiltersValue,
  ResultExamOptionLike,
  ResultScoreChangeEvent,
  ResultSessionOptionLike,
  ResultSessionLike,
  ResultStatsLike,
  ResultStatusChangeEvent,
  ResultStudentRecord
} from '../../components/result-ui.types';
import {ResultHeaderComponent} from '../../components/result-header/result-header.component';
import {ResultStatsComponent} from '../../components/result-stats/result-stats.component';
import {ResultFiltersComponent} from '../../components/result-filters/result-filters.component';
import {ResultSnapshotComponent} from '../../components/result-snapshot/result-snapshot.component';
import {ResultStudentListComponent} from '../../components/result-student-list/result-student-list.component';
import {ResultScoreDialogComponent} from '../../components/result-score-dialog/result-score-dialog.component';

@Component({
  selector: 'app-result-management-page',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    HeaderComponent,
    ResultHeaderComponent,
    ResultStatsComponent,
    ResultFiltersComponent,
    ResultSnapshotComponent,
    ResultStudentListComponent,
    ResultScoreDialogComponent
  ],
  providers: [ResultStateService, ResultFacade],
  templateUrl: './result-management-page.component.html',
  styleUrl: './result-management-page.component.scss',
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({opacity: 0, transform: 'translateY(12px)'}),
        animate('220ms ease-out', style({opacity: 1, transform: 'translateY(0)'}))
      ])
    ])
  ]
})
export class ResultManagementPageComponent implements OnInit {
  readonly currentSession$: Observable<ResultSessionLike | null>;
  readonly stats$: Observable<ResultStatsLike | null>;
  readonly records$: Observable<ResultStudentRecord[]>;
  readonly loading$: Observable<boolean>;
  readonly sessionOptions$: Observable<ResultSessionOptionLike[]>;
  readonly examOptions$: Observable<ResultExamOptionLike[]>;

  filters: ResultFiltersValue = {
    search: '',
    status: 'ALL',
    mention: 'ALL',
    minScore: null,
    maxScore: null
  };

  scoreDialogOpen = false;
  selectedSessionId: number | null = null;
  selectedExamId: number | null = null;
  selectedRecord: ResultStudentRecord | null = null;
  highlightedRecord: ResultStudentRecord | null = null;

  private readonly facade: Record<string, any>;

  constructor(facade: ResultFacade) {
    this.facade = facade as Record<string, any>;
    this.currentSession$ = this.pickStream<ResultSessionLike | null>([
      'currentSession$',
      'session$',
      'resultSession$',
      'selectedSession$'
    ], null);
    this.stats$ = this.pickStream<ResultStatsLike | null>(['stats$', 'summary$', 'resultStats$'], null);
    this.records$ = this.pickStream<ResultStudentRecord[]>([
      'studentResults$',
      'records$',
      'results$',
      'resultRecords$',
      'filteredResults$'
    ], []);
    this.loading$ = this.pickStream<boolean>(['localLoading$', 'loading$', 'isLoading$'], false);
    this.sessionOptions$ = this.pickStream<ResultSessionOptionLike[]>(['sessionOptions$'], []);
    this.examOptions$ = this.pickStream<ResultExamOptionLike[]>(['examOptions$'], []);
  }

  ngOnInit(): void {
    this.callFacade(['init', 'loadResultSetup', 'loadInitialData', 'loadReferenceData', 'loadSessions']);
  }

  selectSession(sessionId: string): void {
    const id = Number(sessionId);
    this.selectedSessionId = Number.isFinite(id) && id > 0 ? id : null;
    if (this.selectedSessionId !== null) {
      this.callFacade(['loadSessionDetails', 'loadResults'], this.selectedSessionId);
    }
  }

  selectExam(examId: string): void {
    const id = Number(examId);
    this.selectedExamId = Number.isFinite(id) && id > 0 ? id : null;
  }

  createSessionFromExam(): void {
    if (this.selectedExamId === null) return;
    this.callFacade(['createSession'], {examId: this.selectedExamId});
    this.selectedExamId = null;
  }

  onFiltersChanged(filters: ResultFiltersValue): void {
    this.filters = filters;
    this.callFacade(['setFilters', 'updateFilters', 'filtersChanged'], {
      search: filters.search,
      status: filters.status === 'ALL' ? '' : filters.status,
      minScore: filters.minScore,
      maxScore: filters.maxScore
    });
  }

  openScoreDialog(record: ResultStudentRecord): void {
    this.selectedRecord = record;
    this.scoreDialogOpen = true;
  }

  closeScoreDialog(): void {
    this.scoreDialogOpen = false;
    this.selectedRecord = null;
  }

  saveScore(event: ResultScoreChangeEvent): void {
    const recordId = event.record.resultId ?? event.record.id;
    const payload = {
      score: event.score,
      comment: event.comment,
      note: event.comment,
      status: event.score === null ? 'PENDING' : event.score >= 10 ? 'PASSED' : 'FAILED'
    };

    if (recordId !== null && recordId !== undefined) {
      this.callFacade([
        'updateScore',
        'updateResultScore',
        'updateStudentScore',
        'saveScore',
        'scoreChanged'
      ], recordId, payload);
    } else {
      this.callFacade(['updateScore', 'updateResultScore', 'saveScore', 'scoreChanged'], event);
    }

    this.closeScoreDialog();
  }

  changeStatus(event: ResultStatusChangeEvent): void {
    const recordId = event.record.resultId ?? event.record.id;
    if (recordId !== null && recordId !== undefined) {
      if (event.status === 'ABSENT') {
        this.callFacade(['updateStatus', 'updateResultStatus', 'updateStudentStatus', 'statusChanged'], recordId, 'ABSENT');
        return;
      }

      this.callFacade([
        'updateStatus',
        'updateResultStatus',
        'updateStudentStatus',
        'statusChanged'
      ], recordId, event.status);
      return;
    }

    this.callFacade(['updateStatus', 'updateResultStatus', 'statusChanged'], event);
  }

  viewDetails(record: ResultStudentRecord): void {
    this.highlightedRecord = record;
    this.callFacade(['viewDetails', 'loadStudentResultDetails', 'selectStudentResult'], record);
  }

  validateResults(): void {
    this.currentSession$.pipe(take(1)).subscribe(session => {
      if (session?.id !== undefined) {
        this.callFacade(['validateResults', 'validateSession', 'validateCurrentSession', 'validateRequested'], session.id);
      }
    });
  }

  publishResults(): void {
    this.currentSession$.pipe(take(1)).subscribe(session => {
      if (session?.id !== undefined) {
        this.callFacade(['publishResults', 'publishSession', 'publishCurrentSession', 'publishRequested'], session.id);
      }
    });
  }

  private pickStream<T>(names: string[], fallback: T): Observable<T> {
    const stream = names.map(name => this.facade[name]).find(value => value && typeof value.subscribe === 'function');
    return stream ?? of(fallback);
  }

  private callFacade(names: string[], ...args: unknown[]): void {
    const name = names.find(candidate => typeof this.facade[candidate] === 'function');
    if (name) {
      this.facade[name](...args);
    }
  }
}
