import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AddAcademicClassRequest,
  AcademicYearOption,
  ProgramOption,
  SpecialityOption
} from '../../models/academic-class.model';

@Component({
  selector: 'app-add-class',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-class.component.html',
  styleUrl: './add-class.component.scss'
})
export class AddClassComponent {
  @Input() isVisible = false;
  @Input() programs: ProgramOption[] = [];
  @Input() specialities: SpecialityOption[] = [];
  @Input() academicYears: AcademicYearOption[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<AddAcademicClassRequest>();

  form: AddAcademicClassRequest = {
    level: 1,
    session: 'JOUR',
    programId: 0,
    specialityId: 0,
    academicYearId: 0
  };

  onSubmit(): void {
    if (!this.form.programId || !this.form.specialityId || !this.form.academicYearId) {
      return;
    }
    this.save.emit({ ...this.form });
    this.resetForm();
  }

  onClose(): void {
    this.close.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.form = {
      level: 1,
      session: 'JOUR',
      programId: 0,
      specialityId: 0,
      academicYearId: 0
    };
  }
}
