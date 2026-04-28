import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicClassOption, AddGroupRequest } from '../../models/group.model';

@Component({
  selector: 'app-add-group',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-group.component.html',
  styleUrl: './add-group.component.scss'
})
export class AddGroupComponent {
  @Input() isVisible = false;
  @Input() classes: AcademicClassOption[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<AddGroupRequest>();

  group: AddGroupRequest = {
    name: '',
    capacity: 1,
    classId: 0
  };

  onSubmit(): void {
    if (!this.group.name || this.group.capacity < 1 || !this.group.classId) {
      return;
    }
    this.save.emit({ ...this.group });
    this.resetForm();
  }

  onClose(): void {
    this.close.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.group = {
      name: '',
      capacity: 1,
      classId: 0
    };
  }
}
