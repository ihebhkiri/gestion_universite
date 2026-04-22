import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddCourseRequest } from '../../models/course.model';
import { SubjectResponse } from '../../../subject-managment/models/subject.model';

@Component({
  selector: 'app-add-course',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-course.component.html',
  styleUrl: './add-course.component.scss'
})
export class AddCourseComponent {
  @Input() isVisible = false;
  @Input() subjects: SubjectResponse[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<AddCourseRequest>();

  form: AddCourseRequest = {
    code: '',
    title: '',
    credits: 0,
    hours: 0,
    subjectId: null
  };

  onSubmit(): void {
    if (!this.form.code || !this.form.title || this.form.subjectId == null) return;
    this.save.emit({ ...this.form });
    this.reset();
  }

  onClose(): void {
    this.close.emit();
    this.reset();
  }

  private reset(): void {
    this.form = { code: '', title: '', credits: 0, hours: 0, subjectId: null };
  }
}

