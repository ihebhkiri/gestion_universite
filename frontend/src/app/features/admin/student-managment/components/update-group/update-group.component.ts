import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicClassOption, AddGroupRequest, GroupResponse } from '../../models/group.model';

@Component({
  selector: 'app-update-group',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-group.component.html',
  styleUrl: './update-group.component.scss'
})
export class UpdateGroupComponent implements OnChanges {
  @Input() isVisible = false;
  @Input() group: GroupResponse | null = null;
  @Input() classes: AcademicClassOption[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ id: number; request: AddGroupRequest }>();

  form: AddGroupRequest = { name: '', capacity: 1, classId: 0 };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['group'] && this.group) {
      this.form = {
        name: this.group.name,
        capacity: this.group.capacity,
        classId: this.group.classId
      };
    }
  }

  onSubmit(): void {
    if (!this.group || !this.form.name || this.form.capacity < 1 || !this.form.classId) {
      return;
    }
    this.save.emit({ id: this.group.id, request: { ...this.form } });
  }

  onClose(): void {
    this.close.emit();
  }
}
