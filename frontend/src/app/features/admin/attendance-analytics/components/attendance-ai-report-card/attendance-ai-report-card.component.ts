import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-attendance-ai-report-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance-ai-report-card.component.html',
  styleUrl: './attendance-ai-report-card.component.scss'
})
export class AttendanceAiReportCardComponent {
  @Input() loading = false;
  @Input() error: string | null = null;
  @Output() generate = new EventEmitter<void>();
}
