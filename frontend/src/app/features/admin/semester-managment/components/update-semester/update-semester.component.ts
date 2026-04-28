import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AcademicYearOption,
  AddSemesterRequest,
  SemesterResponse,
  SemesterStatus
} from '../../models/semester.model';

@Component({
  selector: 'app-update-semester',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-semester.component.html',
  styleUrl: './update-semester.component.scss'
})
export class UpdateSemesterComponent implements OnChanges {
  @Input() isVisible = false;
  @Input() semester: SemesterResponse | null = null;
  @Input() academicYears: AcademicYearOption[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ id: number; request: AddSemesterRequest }>();

  statuses: SemesterStatus[] = ['PLANNED', 'REGISTRATION_OPEN', 'IN_PROGRESS', 'EXAMS', 'CLOSED'];

  form: AddSemesterRequest = {
    name: 'S1',
    academicYearId: 0,
    startDate: '',
    endDate: '',
    status: 'PLANNED',
    examStartDate: null,
    examEndDate: null,
    description: null
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['semester'] && this.semester) {
      this.form = {
        name: this.semester.name,
        academicYearId: this.semester.academicYearId,
        startDate: this.semester.startDate,
        endDate: this.semester.endDate,
        status: this.semester.status,
        examStartDate: this.semester.examStartDate,
        examEndDate: this.semester.examEndDate,
        description: this.semester.description
      };
    }
  }

  onSubmit(): void {
    if (!this.semester || !this.form.name || !this.form.academicYearId || !this.form.startDate || !this.form.endDate) {
      return;
    }
    this.save.emit({ id: this.semester.id, request: { ...this.form } });
  }

  onClose(): void {
    this.close.emit();
  }
}

