import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpecialityResponse, AddSpecialityRequest, ProgramOption } from '../../models/speciality.model';

@Component({
  selector: 'app-update-speciality',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-speciality.component.html',
  styleUrl: './update-speciality.component.scss'
})
export class UpdateSpecialityComponent implements OnChanges {
  @Input() isVisible = false;
  @Input() speciality: SpecialityResponse | null = null;
  @Input() programs: ProgramOption[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ id: number, data: AddSpecialityRequest, newProgramId: number | null }>();

  updateRequest: AddSpecialityRequest = { code: '', name: '' };
  selectedProgramId: number | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['speciality'] && this.speciality) {
      this.updateRequest = {
        code: this.speciality.code,
        name: this.speciality.name
      };
      this.selectedProgramId = this.speciality.programId;
    }
  }

  onSubmit(): void {
    if (this.speciality) {
      const newProgramId = this.selectedProgramId !== this.speciality.programId ? this.selectedProgramId : null;
      this.save.emit({ id: this.speciality.id, data: { ...this.updateRequest }, newProgramId });
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
