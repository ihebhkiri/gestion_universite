import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {
  ResultFiltersValue,
  ResultStatusChangeEvent,
  ResultStudentRecord
} from '../result-ui.types';
import {ResultStudentCardComponent} from '../result-student-card/result-student-card.component';

@Component({
  selector: 'app-result-student-list',
  standalone: true,
  imports: [CommonModule, ResultStudentCardComponent],
  templateUrl: './result-student-list.component.html',
  styleUrl: './result-student-list.component.scss'
})
export class ResultStudentListComponent {
  @Input() records: ResultStudentRecord[] | null = [];
  @Input() filters: ResultFiltersValue | null = null;
  @Input() loading = false;
  @Input() highlightedRecord: ResultStudentRecord | null = null;
  @Output() scoreChanged = new EventEmitter<ResultStudentRecord>();
  @Output() statusChanged = new EventEmitter<ResultStatusChangeEvent>();
  @Output() viewDetails = new EventEmitter<ResultStudentRecord>();

  get visibleRecords(): ResultStudentRecord[] {
    const filters = this.filters;
    const search = filters?.search.trim().toLowerCase() ?? '';
    const minScore = filters?.minScore;
    const maxScore = filters?.maxScore;
    return (this.records ?? []).filter(record => {
      const score = this.score(record);
      const status = this.uiStatus(record);
      const haystack = [
        record.studentName,
        record.fullName,
        record.firstName,
        record.lastName,
        record.matricule,
        record.studentMatricule,
        record.cin
      ].filter(Boolean).join(' ').toLowerCase();
      const mention = this.mentionCode(record);

      return (!search || haystack.includes(search))
        && (!filters || filters.status === 'ALL' || status === filters.status)
        && (!filters || filters.mention === 'ALL' || mention === filters.mention)
        && (minScore === null || minScore === undefined || (score !== null && score >= minScore))
        && (maxScore === null || maxScore === undefined || (score !== null && score <= maxScore));
    });
  }

  isHighlighted(record: ResultStudentRecord): boolean {
    const selectedId = this.highlightedRecord?.resultId ?? this.highlightedRecord?.id ?? this.highlightedRecord?.studentId;
    const recordId = record.resultId ?? record.id ?? record.studentId;
    return selectedId !== undefined && selectedId === recordId;
  }

  trackByRecordId(_: number, record: ResultStudentRecord): number | string {
    return record.resultId ?? record.id ?? record.studentId ?? `${record.studentName}-${record.matricule}`;
  }

  private score(record: ResultStudentRecord): number | null {
    return record.score ?? record.grade ?? record.finalScore ?? record.average ?? null;
  }

  private mention(record: ResultStudentRecord): string {
    const code = this.mentionCode(record);
    const labels: Record<string, string> = {
      EXCELLENT: 'excellent',
      BIEN: 'bien',
      ASSEZ_BIEN: 'assez bien',
      PASSABLE: 'passable',
      FAILED: 'failed',
      PENDING: 'pending'
    };
    return labels[code] ?? code.toLowerCase();
  }

  private mentionCode(record: ResultStudentRecord): string {
    const score = this.score(record);
    if (record.mention) return record.mention.toUpperCase().replace(/\s+/g, '_');
    if (score === null) return 'PENDING';
    if (score >= 16) return 'EXCELLENT';
    if (score >= 14) return 'BIEN';
    if (score >= 12) return 'ASSEZ_BIEN';
    if (score >= 10) return 'PASSABLE';
    return 'FAILED';
  }

  private uiStatus(record: ResultStudentRecord): string {
    if (record.status === 'PASSED' || record.status === 'FAILED' || record.status === 'ABSENT' || record.status === 'PENDING') {
      return record.status;
    }
    const note = `${record.comment ?? record.note ?? ''}`.toLowerCase();
    const score = this.score(record);
    if (note.includes('absent')) return 'ABSENT';
    if (score === null) return 'PENDING';
    return score >= 10 ? 'PASSED' : 'FAILED';
  }
}
