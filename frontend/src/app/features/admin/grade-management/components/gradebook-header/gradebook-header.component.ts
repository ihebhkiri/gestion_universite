import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Exam, GradeCourseOption} from '../../models/grade-management.model';

@Component({
  selector: 'app-gradebook-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gradebook-header.component.html',
  styleUrl: './gradebook-header.component.scss'
})
export class GradebookHeaderComponent {
  @Input() exam: Exam | null = null;
  @Input() courses: GradeCourseOption[] | null = [];
  @Input() exams: Exam[] | null = [];
  @Input() selectedCourseId: number | null = null;
  @Output() courseChanged = new EventEmitter<number>();
  @Output() examSelected = new EventEmitter<number>();
  @Output() createRequested = new EventEmitter<void>();
  @Output() publishRequested = new EventEmitter<void>();

  get courseLabel(): string {
    if (!this.exam) return 'No course selected';
    return `${this.exam.courseCode ?? 'Course'}${this.exam.courseTitle ? ' - ' + this.exam.courseTitle : ''}`;
  }

  get classLabel(): string {
    if (!this.exam) return 'No class';
    return this.exam.groupName
      ? `${this.exam.classCode ?? 'Class'} / ${this.exam.groupName}`
      : this.exam.classCode ?? 'All class';
  }

  get dateLabel(): string {
    if (!this.exam?.examDate) return 'No date';
    return this.exam.startTime
      ? `${this.exam.examDate} at ${this.exam.startTime.slice(0, 5)}`
      : this.exam.examDate;
  }

  get coefficientLabel(): string {
    return this.exam?.weight !== null && this.exam?.weight !== undefined ? `${this.exam.weight}` : '1';
  }

  onCourseChange(value: string): void {
    const courseId = Number(value);
    if (Number.isFinite(courseId) && courseId > 0) {
      this.courseChanged.emit(courseId);
    }
  }

  onExamChange(value: string): void {
    const examId = Number(value);
    if (Number.isFinite(examId) && examId > 0) {
      this.examSelected.emit(examId);
    }
  }
}
