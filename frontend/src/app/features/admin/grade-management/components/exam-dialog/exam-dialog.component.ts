import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  CreateExamPayload,
  GRADE_EXAM_SESSION_TYPES,
  GRADE_EXAM_STATUSES,
  GRADE_EXAM_TYPES,
  GradeCourseOption,
  GradeReferenceOption
} from '../../models/grade-management.model';

@Component({
  selector: 'app-grade-exam-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './exam-dialog.component.html',
  styleUrl: './exam-dialog.component.scss'
})
export class ExamDialogComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() visible = false;
  @Input() loading = false;
  @Input() selectedCourseId: number | null = null;
  @Input() courses: GradeCourseOption[] | null = [];
  @Input() classes: GradeReferenceOption[] | null = [];
  @Input() groups: GradeReferenceOption[] | null = [];
  @Input() rooms: GradeReferenceOption[] | null = [];
  @Input() supervisors: GradeReferenceOption[] | null = [];
  @Input() semesters: GradeReferenceOption[] | null = [];
  @Output() closed = new EventEmitter<void>();
  @Output() created = new EventEmitter<CreateExamPayload>();

  readonly examTypes = GRADE_EXAM_TYPES;
  readonly sessionTypes = GRADE_EXAM_SESSION_TYPES;
  readonly statuses = GRADE_EXAM_STATUSES;

  readonly form = this.fb.group({
    title: this.fb.nonNullable.control('', [Validators.required, Validators.maxLength(120)]),
    courseId: this.fb.nonNullable.control('', Validators.required),
    classId: this.fb.nonNullable.control('', Validators.required),
    groupId: this.fb.nonNullable.control(''),
    roomId: this.fb.nonNullable.control('', Validators.required),
    supervisorId: this.fb.nonNullable.control('', Validators.required),
    semesterId: this.fb.nonNullable.control('', Validators.required),
    examDate: this.fb.nonNullable.control(this.today(), Validators.required),
    startTime: this.fb.nonNullable.control('09:00', Validators.required),
    endTime: this.fb.nonNullable.control('10:30', Validators.required),
    type: this.fb.nonNullable.control<'PROJECT' | 'EXAM' | 'DS' | 'TP' | 'ORAL'>('EXAM', Validators.required),
    sessionType: this.fb.nonNullable.control<'MAIN' | 'RESIT' | ''>('MAIN'),
    status: this.fb.nonNullable.control<'DRAFT' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'PUBLISHED' | 'CANCELLED'>('PLANNED'),
    duration: this.fb.control<number | null>(1.5),
    weight: this.fb.control<number | null>(1),
    instructions: this.fb.nonNullable.control('', Validators.maxLength(1000))
  });

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['visible'] && this.visible) || changes['selectedCourseId']) {
      this.patchSelectedCourse();
    }
  }

  close(): void {
    this.closed.emit();
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    if (value.endTime <= value.startTime) {
      this.form.controls.endTime.setErrors({range: true});
      return;
    }

    this.created.emit({
      title: value.title.trim(),
      courseId: Number(value.courseId),
      classId: Number(value.classId),
      groupId: this.optionalNumber(value.groupId),
      roomId: Number(value.roomId),
      supervisorId: Number(value.supervisorId),
      semesterId: Number(value.semesterId),
      examDate: value.examDate,
      startTime: value.startTime,
      endTime: value.endTime,
      type: value.type,
      sessionType: value.sessionType || null,
      status: value.status,
      duration: value.duration,
      weight: value.weight,
      instructions: value.instructions.trim() || null
    });

    this.resetForm();
  }

  invalid(controlName: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  private patchSelectedCourse(): void {
    if (!this.selectedCourseId || this.form.controls.courseId.value) return;
    this.form.controls.courseId.setValue(`${this.selectedCourseId}`);
  }

  private resetForm(): void {
    this.form.reset({
      title: '',
      courseId: this.selectedCourseId ? `${this.selectedCourseId}` : '',
      classId: '',
      groupId: '',
      roomId: '',
      supervisorId: '',
      semesterId: '',
      examDate: this.today(),
      startTime: '09:00',
      endTime: '10:30',
      type: 'EXAM',
      sessionType: 'MAIN',
      status: 'PLANNED',
      duration: 1.5,
      weight: 1,
      instructions: ''
    });
  }

  private optionalNumber(value: string | null | undefined): number | null {
    if (!value) return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  }

  private today(): string {
    const date = new Date();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }
}
