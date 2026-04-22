import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AcademicClassResponse,
  AddAcademicClassRequest,
  AcademicYearOption,
  ProgramOption,
  SpecialityOption
} from '../../models/academic-class.model';

@Component({
  selector: 'app-update-class',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-class.component.html',
  styleUrl: './update-class.component.scss'
})
export class UpdateClassComponent implements OnChanges {
  @Input() isVisible = false;
  @Input() academicClass: AcademicClassResponse | null = null;
  @Input() programs: ProgramOption[] = [];
  @Input() specialities: SpecialityOption[] = [];
  @Input() academicYears: AcademicYearOption[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ id: number; request: AddAcademicClassRequest }>();

  form: AddAcademicClassRequest = {
    level: 1,
    session: 'JOUR',
    programId: 0,
    specialityId: 0,
    academicYearId: 0
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['academicClass'] && this.academicClass) {
      this.form = {
        level: this.academicClass.level,
        session: this.academicClass.session,
        programId: this.academicClass.programId,
        specialityId: this.academicClass.specialityId,
        academicYearId: this.academicClass.academicYearId
      };
    }
  }

  onSubmit(): void {
    if (!this.academicClass || !this.form.programId || !this.form.specialityId || !this.form.academicYearId) {
      return;
    }
    this.save.emit({ id: this.academicClass.id, request: { ...this.form } });
  }

  onClose(): void {
    this.close.emit();
  }
}
