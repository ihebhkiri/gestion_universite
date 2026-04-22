import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddAcademicYearRequest } from '../../models/academic-year.model';

@Component({
  selector: 'app-add-academic-year',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-academic-year.component.html',
  styleUrl: './add-academic-year.component.scss'
})
export class AddAcademicYearComponent {
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<AddAcademicYearRequest>();

  form: AddAcademicYearRequest = {
    label: '',
    startDate: '',
    endDate: '',
    active: false
  };

  onSubmit(): void {
    if (!this.form.label || !this.form.startDate || !this.form.endDate) {
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
      label: '',
      startDate: '',
      endDate: '',
      active: false
    };
  }
}

