import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddSpecialityRequest, ProgramOption } from '../../models/speciality.model';

@Component({
  selector: 'app-add-speciality',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-speciality.component.html',
  styleUrl: './add-speciality.component.scss'
})
export class AddSpecialityComponent {
  @Input() isVisible = false;
  @Input() programs: ProgramOption[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ programId: number, request: AddSpecialityRequest }>();

  selectedProgramId: number | null = null;
  speciality: AddSpecialityRequest = { code: '', name: '' };

  onSubmit(): void {
    if (this.selectedProgramId) {
      this.save.emit({ programId: this.selectedProgramId, request: { ...this.speciality } });
      this.resetForm();
    }
  }

  onClose(): void {
    this.close.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.speciality = { code: '', name: '' };
    this.selectedProgramId = null;
  }
}
