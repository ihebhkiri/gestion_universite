import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ExamResponse} from '../../models/exam.model';

@Component({
  selector: 'app-exam-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-list.component.html',
  styleUrl: './exam-list.component.scss'
})
export class ExamListComponent {
  @Input() exams: ExamResponse[] | null = [];
  @Input() selectedExam: ExamResponse | null = null;
  @Output() examSelected = new EventEmitter<ExamResponse>();
}
