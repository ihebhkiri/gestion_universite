import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddDepartmentRequest } from '../../models/department.model';

@Component({
  selector: 'app-add-department',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-department.component.html',
  styleUrl: './add-department.component.scss'
})
export class AddDepartmentComponent {
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<AddDepartmentRequest>();

  department: AddDepartmentRequest = {
    code: '',
    name: ''
  };

  onSubmit(): void {
    this.save.emit({ ...this.department });
    this.resetForm();
  }

  onClose(): void {
    this.close.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.department = { code: '', name: '' };
  }
}
