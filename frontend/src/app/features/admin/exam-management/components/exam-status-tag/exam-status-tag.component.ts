import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';
import {ExamStatus} from '../../models/exam.model';

@Component({
  selector: 'app-exam-status-tag',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-status-tag.component.html',
  styleUrl: './exam-status-tag.component.scss'
})
export class ExamStatusTagComponent {
  @Input() status: ExamStatus | null = null;

  get label(): string {
    if (this.status === 'IN_PROGRESS') return 'In progress';
    if (this.status === 'COMPLETED') return 'Completed';
    if (this.status === 'CANCELLED') return 'Cancelled';
    return 'Planned';
  }

  get statusClass(): string {
    return `exam-status-tag--${(this.status ?? 'PLANNED').toLowerCase().replace('_', '-')}`;
  }
}
