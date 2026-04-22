import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicYearResponse, AddAcademicYearRequest } from '../../models/academic-year.model';

@Component({
  selector: 'app-update-academic-year',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-academic-year.component.html',
  styleUrl: './update-academic-year.component.scss'
})
export class UpdateAcademicYearComponent implements OnChanges {
  @Input() isVisible = false;
  @Input() year: AcademicYearResponse | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ id: number; request: AddAcademicYearRequest }>();

  form: AddAcademicYearRequest = {
    label: '',
    startDate: '',
    endDate: '',
    active: false
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['year'] && this.year) {
      this.form = {
        label: this.year.label,
        startDate: this.year.startDate,
        endDate: this.year.endDate,
        active: this.year.active
      };
    }
  }

  onSubmit(): void {
    if (!this.year || !this.form.label || !this.form.startDate || !this.form.endDate) {
      return;
    }
    this.save.emit({ id: this.year.id, request: { ...this.form } });
  }

  onClose(): void {
    this.close.emit();
  }
}

