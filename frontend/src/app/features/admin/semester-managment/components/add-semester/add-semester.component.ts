import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicYearOption, AddSemesterRequest, SemesterStatus } from '../../models/semester.model';

@Component({
  selector: 'app-add-semester',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-semester.component.html',
  styleUrl: './add-semester.component.scss'
})
export class AddSemesterComponent {
  @Input() isVisible = false;
  @Input() academicYears: AcademicYearOption[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<AddSemesterRequest>();

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

  onSubmit(): void {
    if (!this.form.name || !this.form.academicYearId || !this.form.startDate || !this.form.endDate) {
      return;
    }
    this.save.emit({ ...this.form });
    this.reset();
  }

  onClose(): void {
    this.close.emit();
    this.reset();
  }

  private reset(): void {
    this.form = {
      name: 'S1',
      academicYearId: 0,
      startDate: '',
      endDate: '',
      status: 'PLANNED',
      examStartDate: null,
      examEndDate: null,
      description: null
    };
  }
}

