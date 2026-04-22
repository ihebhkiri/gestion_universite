import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentResponse, AddDepartmentRequest } from '../../models/department.model';

@Component({
  selector: 'app-update-department',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-department.component.html',
  styleUrl: './update-department.component.scss'
})
export class UpdateDepartmentComponent implements OnChanges {
  @Input() isVisible = false;
  @Input() department: DepartmentResponse | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ id: number, data: AddDepartmentRequest }>();

  updateRequest: AddDepartmentRequest = {
    code: '',
    name: ''
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['department'] && this.department) {
      this.updateRequest = {
        code: this.department.code,
        name: this.department.name
      };
    }
  }

  onSubmit(): void {
    if (this.department) {
      this.save.emit({ id: this.department.id, data: { ...this.updateRequest } });
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
