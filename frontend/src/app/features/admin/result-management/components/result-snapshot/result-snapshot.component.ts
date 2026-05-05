import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ResultSessionLike, ResultStatsLike, ResultStudentRecord} from '../result-ui.types';

@Component({
  selector: 'app-result-snapshot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result-snapshot.component.html',
  styleUrl: './result-snapshot.component.scss'
})
export class ResultSnapshotComponent {
  @Input() session: ResultSessionLike | null = null;
  @Input() stats: ResultStatsLike | null = null;
  @Input() records: ResultStudentRecord[] | null = [];
  @Output() viewDetails = new EventEmitter<ResultStudentRecord>();

  get successRate(): number {
    if (typeof this.stats?.successRate === 'number') return Math.round(this.stats.successRate);
    const passed = (this.records ?? []).filter(record => this.status(record) === 'PASSED').length;
    const failed = (this.records ?? []).filter(record => this.status(record) === 'FAILED').length;
    return passed + failed ? Math.round((passed / (passed + failed)) * 100) : 0;
  }

  get topRecords(): ResultStudentRecord[] {
    return [...(this.records ?? [])]
      .filter(record => this.score(record) !== null)
      .sort((left, right) => (this.score(right) ?? 0) - (this.score(left) ?? 0))
      .slice(0, 5);
  }

  get attentionRecords(): ResultStudentRecord[] {
    return (this.records ?? [])
      .filter(record => this.status(record) === 'FAILED' || this.status(record) === 'ABSENT' || this.status(record) === 'PENDING')
      .slice(0, 5);
  }

  studentName(record: ResultStudentRecord): string {
    return (record.fullName ?? record.studentName ?? `${record.firstName ?? ''} ${record.lastName ?? ''}`.trim()) || 'Etudiant';
  }

  scoreLabel(record: ResultStudentRecord): string {
    const score = this.score(record);
    return score === null ? '-/20' : `${score}/20`;
  }

  status(record: ResultStudentRecord): string {
    if (record.status === 'PASSED' || record.status === 'FAILED' || record.status === 'ABSENT' || record.status === 'PENDING') {
      return record.status;
    }
    const note = `${record.comment ?? record.note ?? ''}`.toLowerCase();
    const score = this.score(record);
    if (note.includes('absent')) return 'ABSENT';
    if (score === null) return 'PENDING';
    return score >= 10 ? 'PASSED' : 'FAILED';
  }

  private score(record: ResultStudentRecord): number | null {
    return record.score ?? record.grade ?? record.finalScore ?? record.average ?? null;
  }
}
