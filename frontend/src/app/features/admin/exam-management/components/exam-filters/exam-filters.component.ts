import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {ExamFilterForm, ExamOption, ExamStatus} from '../../models/exam.model';

@Component({
  selector: 'app-exam-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './exam-filters.component.html',
  styleUrl: './exam-filters.component.scss'
})
export class ExamFiltersComponent {
  @Input({required: true}) form!: FormGroup<ExamFilterForm>;
  @Input() academicYears: ExamOption[] | null = [];
  @Input() semesters: ExamOption[] | null = [];
  @Input() courses: ExamOption[] | null = [];
  @Input() classes: ExamOption[] | null = [];
  @Input() groups: ExamOption[] | null = [];
  @Input() rooms: ExamOption[] | null = [];
  @Input() supervisors: ExamOption[] | null = [];
  @Input() statuses: {value: ExamStatus; label: string}[] = [];
  @Output() resetRequested = new EventEmitter<void>();
  @Output() refreshRequested = new EventEmitter<void>();
}
