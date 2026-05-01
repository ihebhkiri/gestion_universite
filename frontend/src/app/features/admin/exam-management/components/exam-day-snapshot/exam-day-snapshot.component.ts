import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ExamResponse} from '../../models/exam.model';
import {ExamStatusTagComponent} from '../exam-status-tag/exam-status-tag.component';

@Component({
  selector: 'app-exam-day-snapshot',
  standalone: true,
  imports: [CommonModule, ExamStatusTagComponent],
  templateUrl: './exam-day-snapshot.component.html',
  styleUrl: './exam-day-snapshot.component.scss'
})
export class ExamDaySnapshotComponent {
  @Input() exams: ExamResponse[] | null = [];
  @Input() selectedDate: string | null = null;
  @Input() selectedExam: ExamResponse | null = null;
  @Output() examSelected = new EventEmitter<ExamResponse>();
  @Output() createRequested = new EventEmitter<string | null>();

  get sortedExams(): ExamResponse[] {
    return [...(this.exams ?? [])].sort((left, right) => (left.startTime ?? '').localeCompare(right.startTime ?? ''));
  }

  get title(): string {
    return this.selectedDate ?? 'All scheduled exams';
  }
}
