import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgramResponse, AddProgramRequest, DepartmentOption } from '../../models/program.model';

@Component({
  selector: 'app-update-program',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-program.component.html',
  styleUrl: './update-program.component.scss'
})
export class UpdateProgramComponent implements OnChanges {
  @Input() isVisible = false;
  @Input() program: ProgramResponse | null = null;
  @Input() departments: DepartmentOption[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ id: number, data: AddProgramRequest, newDepartmentId: number | null }>();

  updateRequest: AddProgramRequest = { code: '', name: '' };
  selectedDepartmentId: number | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['program'] && this.program) {
      this.updateRequest = {
        code: this.program.code,
        name: this.program.name
      };
      this.selectedDepartmentId = this.program.departmentId;
    }
  }

  onSubmit(): void {
    if (this.program) {
      const newDepartmentId = this.selectedDepartmentId !== this.program.departmentId ? this.selectedDepartmentId : null;
      this.save.emit({ id: this.program.id, data: { ...this.updateRequest }, newDepartmentId });
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
