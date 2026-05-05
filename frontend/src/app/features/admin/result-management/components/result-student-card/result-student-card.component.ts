import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ResultStatus, ResultStatusChangeEvent, ResultStudentRecord} from '../result-ui.types';

@Component({
  selector: 'app-result-student-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result-student-card.component.html',
  styleUrl: './result-student-card.component.scss'
})
export class ResultStudentCardComponent {
  @Input({required: true}) record!: ResultStudentRecord;
  @Input() highlighted = false;
  @Output() scoreChanged = new EventEmitter<ResultStudentRecord>();
  @Output() statusChanged = new EventEmitter<ResultStatusChangeEvent>();
  @Output() viewDetails = new EventEmitter<ResultStudentRecord>();

  get studentName(): string {
    const full = this.record.fullName ?? this.record.studentName;
    if (full) return full;
    return `${this.record.firstName ?? ''} ${this.record.lastName ?? ''}`.trim() || 'Etudiant';
  }

  get identity(): string {
    const parts = [this.record.matricule ?? this.record.studentMatricule, this.record.cin, this.record.groupName ?? this.record.classCode]
      .filter(Boolean);
    return parts.length ? parts.join(' - ') : 'Identite non renseignee';
  }

  get initials(): string {
    return this.studentName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join('') || 'ET';
  }

  get score(): number | null {
    return this.record.score ?? this.record.grade ?? this.record.finalScore ?? this.record.average ?? null;
  }

  get scoreLabel(): string {
    const maxScore = this.record.maxScore ?? 20;
    return this.score === null ? `-/ ${maxScore}` : `${this.score} / ${maxScore}`;
  }

  get progress(): number {
    const maxScore = this.record.maxScore ?? 20;
    return this.score === null ? 0 : Math.min(100, Math.max(0, (this.score / maxScore) * 100));
  }

  get status(): ResultStatus {
    if (this.record.status === 'PASSED' || this.record.status === 'FAILED' || this.record.status === 'ABSENT' || this.record.status === 'PENDING') {
      return this.record.status;
    }
    const note = `${this.record.comment ?? this.record.note ?? ''}`.toLowerCase();
    if (note.includes('absent')) return 'ABSENT';
    if (this.score === null) return 'PENDING';
    return this.score >= 10 ? 'PASSED' : 'FAILED';
  }

  get mention(): string {
    if (this.record.mention) return this.record.mention;
    if (this.score === null) return 'A saisir';
    if (this.score >= 16) return 'Excellent';
    if (this.score >= 14) return 'Bien';
    if (this.score >= 12) return 'Assez bien';
    if (this.score >= 10) return 'Passable';
    return 'Insuffisant';
  }

  get statusLabel(): string {
    const labels: Record<string, string> = {
      PASSED: 'Admis',
      FAILED: 'Echec',
      ABSENT: 'Absent',
      PENDING: 'En attente'
    };
    return labels[this.status] ?? this.status;
  }

  markAbsent(): void {
    this.statusChanged.emit({record: this.record, status: 'ABSENT'});
  }
}
