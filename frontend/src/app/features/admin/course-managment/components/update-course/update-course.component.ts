import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddCourseRequest, CourseResponse } from '../../models/course.model';
import { SubjectResponse } from '../../../subject-managment/models/subject.model';

@Component({
  selector: 'app-update-course',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-course.component.html',
  styleUrl: './update-course.component.scss'
})
export class UpdateCourseComponent implements OnChanges {
  @Input() isVisible = false;
  @Input() course: CourseResponse | null = null;
  @Input() subjects: SubjectResponse[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ id: number; request: AddCourseRequest }>();

  form: AddCourseRequest = {
    code: '',
    title: '',
    credits: 0,
    hours: 0,
    subjectId: null
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['course'] && this.course) {
      this.form = {
        code: this.course.code,
        title: this.course.title,
        credits: this.course.credits ?? 0,
        hours: this.course.hours ?? 0,
        subjectId: this.course.subjectId ?? null
      };
    }
  }

  onSubmit(): void {
    if (!this.course || !this.form.code || !this.form.title || this.form.subjectId == null) return;
    this.save.emit({ id: this.course.id, request: { ...this.form } });
  }

  onClose(): void {
    this.close.emit();
  }
}

