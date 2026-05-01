import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';
import {ExamSummary} from '../../models/exam.model';

@Component({
  selector: 'app-exam-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-summary.component.html',
  styleUrl: './exam-summary.component.scss'
})
export class ExamSummaryComponent {
  @Input() summary: ExamSummary | null = null;
}
