import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Exam, GradeRecord} from '../../models/grade-management.model';
import {GradeRowSaveEvent, GradeStudentRowComponent} from '../grade-student-row/grade-student-row.component';

@Component({
  selector: 'app-grade-student-list',
  standalone: true,
  imports: [CommonModule, GradeStudentRowComponent],
  templateUrl: './grade-student-list.component.html',
  styleUrl: './grade-student-list.component.scss'
})
export class GradeStudentListComponent {
  @Input() exam: Exam | null = null;
  @Input() records: GradeRecord[] | null = [];
  @Input() loading = false;
  @Output() gradeSaved = new EventEmitter<GradeRowSaveEvent>();
  @Output() gradeValidated = new EventEmitter<GradeRecord>();

  get disabled(): boolean {
    return !this.exam || this.exam.status === 'PUBLISHED';
  }
}
