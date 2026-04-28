import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentResponse, UpdateStudentRequest } from '../../models/student.model';

@Component({
  selector: 'app-update-student',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-student.component.html',
  styleUrl: './update-student.component.scss'
})
export class UpdateStudentComponent implements OnChanges {
  @Input() isVisible = false;
  @Input() student: StudentResponse | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ id: number, updateData: UpdateStudentRequest }>();

  updateRequest: UpdateStudentRequest = {
    cin: '',
    firstName: '',
    lastName: '',
    gender: 'MALE',
    phone: ''
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['student'] && this.student) {
      this.updateRequest = {
        cin: this.student.cin,
        firstName: this.student.firstName,
        lastName: this.student.lastName,
        gender: this.student.gender,
        phone: this.student.phone
      };
    }
  }

  onSubmit(): void {
    if (this.student) {
      this.save.emit({ id: this.student.id, updateData: this.updateRequest });
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
