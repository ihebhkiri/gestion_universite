import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {
  ExamConflict,
  ExamDialogForm,
  ExamOption,
  ExamSessionType,
  ExamStatus,
  ExamType
} from '../../models/exam.model';
import {ExamConflictPanelComponent} from '../exam-conflict-panel/exam-conflict-panel.component';

@Component({
  selector: 'app-exam-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ExamConflictPanelComponent],
  templateUrl: './exam-dialog.component.html',
  styleUrl: './exam-dialog.component.scss'
})
export class ExamDialogComponent {
  @Input() visible = false;
  @Input({required: true}) form!: FormGroup<ExamDialogForm>;
  @Input() courses: ExamOption[] | null = [];
  @Input() classes: ExamOption[] | null = [];
  @Input() groups: ExamOption[] | null = [];
  @Input() rooms: ExamOption[] | null = [];
  @Input() supervisors: ExamOption[] | null = [];
  @Input() semesters: ExamOption[] | null = [];
  @Input() types: {value: ExamType; label: string}[] = [];
  @Input() statuses: {value: ExamStatus; label: string}[] = [];
  @Input() sessionTypes: {value: ExamSessionType; label: string}[] = [];
  @Input() conflicts: ExamConflict[] | null = [];
  @Input() loading = false;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();
  @Output() conflictsChecked = new EventEmitter<void>();

  invalid(controlName: keyof ExamDialogForm): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }
}
