import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddProgramRequest, DepartmentOption } from '../../models/program.model';

@Component({
  selector: 'app-add-program',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-program.component.html',
  styleUrl: './add-program.component.scss'
})
export class AddProgramComponent {
  @Input() isVisible = false;
  @Input() departments: DepartmentOption[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ departmentId: number, request: AddProgramRequest }>();

  selectedDepartmentId: number | null = null;
  program: AddProgramRequest = { code: '', name: '' };

  onSubmit(): void {
    if (this.selectedDepartmentId) {
      this.save.emit({ departmentId: this.selectedDepartmentId, request: { ...this.program } });
      this.resetForm();
    }
  }

  onClose(): void {
    this.close.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.program = { code: '', name: '' };
    this.selectedDepartmentId = null;
  }
}
