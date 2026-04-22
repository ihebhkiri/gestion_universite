import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddStudentRequest } from '../../models/student.model';

@Component({
  selector: 'app-add-student',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-student.component.html',
  styleUrl: './add-student.component.scss'
})
export class AddStudentComponent {
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ student: AddStudentRequest, image: File | undefined }>();

  student: AddStudentRequest = {
    email: '',
    password: '',
    role: 'STUDENT',
    cin: '',
    firstName: '',
    lastName: '',
    gender: 'MALE',
    phone: ''
  };

  selectedImage: File | undefined;
  imagePreview: string | null = null;

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    this.save.emit({ student: this.student, image: this.selectedImage });
    this.resetForm();
  }

  onClose(): void {
    this.close.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.student = {
      email: '',
      password: '',
      role: 'STUDENT',
      cin: '',
      firstName: '',
      lastName: '',
      gender: 'MALE',
      phone: ''
    };
    this.selectedImage = undefined;
    this.imagePreview = null;
  }
}
