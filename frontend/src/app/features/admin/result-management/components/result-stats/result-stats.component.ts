import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';
import {ResultStatsLike, ResultStudentRecord} from '../result-ui.types';

interface ResultStatCard {
  label: string;
  value: string;
  icon: string;
  tone: string;
}

@Component({
  selector: 'app-result-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result-stats.component.html',
  styleUrl: './result-stats.component.scss'
})
export class ResultStatsComponent {
  @Input() stats: ResultStatsLike | null = null;
  @Input() records: ResultStudentRecord[] | null = [];

  get total(): number {
    return this.numberValue(this.stats?.totalRecords ?? this.stats?.totalStudents ?? this.stats?.total) || (this.records ?? []).length;
  }

  get passed(): number {
    return this.numberValue(this.stats?.passedCount ?? this.stats?.admittedCount ?? this.stats?.passCount) || this.countByStatus('PASSED');
  }

  get failed(): number {
    return this.numberValue(this.stats?.failedCount ?? this.stats?.failCount) || this.countByStatus('FAILED');
  }

  get absent(): number {
    return this.numberValue(this.stats?.absentCount) || this.countByStatus('ABSENT');
  }

  get pending(): number {
    return this.numberValue(this.stats?.pendingCount ?? this.stats?.notRecordedCount) || this.countByStatus('PENDING');
  }

  get average(): number | null {
    return this.stats?.classAverage ?? this.stats?.averageScore ?? this.averageFromRecords();
  }

  get best(): number | null {
    return this.stats?.bestScore ?? this.stats?.maxScore ?? this.bestFromRecords();
  }

  get successRate(): number {
    const directRate = this.stats?.successRate;
    if (directRate !== null && directRate !== undefined) return Math.round(directRate);
    const denominator = this.passed + this.failed;
    return denominator ? Math.round((this.passed / denominator) * 100) : 0;
  }

  get cards(): ResultStatCard[] {
    return [
      {label: 'Admis', value: `${this.passed}`, icon: 'verified', tone: 'green'},
      {label: 'Echecs', value: `${this.failed}`, icon: 'cancel', tone: 'red'},
      {label: 'Absents', value: `${this.absent}`, icon: 'person_off', tone: 'orange'},
      {label: 'Moyenne classe', value: this.score(this.average), icon: 'monitoring', tone: 'blue'},
      {label: 'Meilleure note', value: this.score(this.best), icon: 'emoji_events', tone: 'cyan'},
      {label: 'En attente', value: `${this.pending}`, icon: 'pending', tone: 'slate'}
    ];
  }

  private countByStatus(status: string): number {
    return (this.records ?? []).filter(record => this.uiStatus(record) === status).length;
  }

  private averageFromRecords(): number | null {
    const scores = this.scores();
    if (!scores.length) return null;
    return Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100) / 100;
  }

  private bestFromRecords(): number | null {
    const scores = this.scores();
    return scores.length ? Math.max(...scores) : null;
  }

  private scores(): number[] {
    return (this.records ?? [])
      .map(record => record.score ?? record.grade ?? record.finalScore ?? record.average)
      .filter((score): score is number => typeof score === 'number');
  }

  private uiStatus(record: ResultStudentRecord): string {
    if (record.status === 'PASSED' || record.status === 'FAILED' || record.status === 'ABSENT' || record.status === 'PENDING') {
      return record.status;
    }
    const note = `${record.comment ?? record.note ?? ''}`.toLowerCase();
    const score = record.score ?? record.grade ?? record.finalScore ?? record.average ?? null;
    if (note.includes('absent')) return 'ABSENT';
    if (score === null) return 'PENDING';
    return score >= 10 ? 'PASSED' : 'FAILED';
  }

  private numberValue(value: number | null | undefined): number {
    return typeof value === 'number' ? value : 0;
  }

  private score(value: number | null | undefined): string {
    return value === null || value === undefined ? '-' : `${value}/20`;
  }
}
