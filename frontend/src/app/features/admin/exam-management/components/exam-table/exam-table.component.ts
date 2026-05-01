import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {EXAM_STATUSES, ExamResponse, ExamStatus} from '../../models/exam.model';
import {ExamStatusTagComponent} from '../exam-status-tag/exam-status-tag.component';

@Component({
  selector: 'app-exam-table',
  standalone: true,
  imports: [CommonModule, ExamStatusTagComponent],
  templateUrl: './exam-table.component.html',
  styleUrl: './exam-table.component.scss'
})
export class ExamTableComponent {
  @Input() exams: ExamResponse[] | null = [];
  @Input() selectedExam: ExamResponse | null = null;
  @Input() statusOptions = EXAM_STATUSES;
  @Output() examSelected = new EventEmitter<ExamResponse>();
  @Output() editRequested = new EventEmitter<ExamResponse>();
  @Output() deleteRequested = new EventEmitter<ExamResponse>();
  @Output() cancelRequested = new EventEmitter<ExamResponse>();
  @Output() statusChanged = new EventEmitter<{exam: ExamResponse; status: ExamStatus}>();

  get sortedExams(): ExamResponse[] {
    return [...(this.exams ?? [])].sort((left, right) => {
      const dateCompare = (left.examDate ?? '').localeCompare(right.examDate ?? '');
      if (dateCompare !== 0) return dateCompare;
      return (left.startTime ?? '').localeCompare(right.startTime ?? '');
    });
  }

  changeStatus(exam: ExamResponse, value: string): void {
    this.statusChanged.emit({exam, status: value as ExamStatus});
  }
}
