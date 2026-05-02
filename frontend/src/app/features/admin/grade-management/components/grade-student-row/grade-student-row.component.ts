import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {GradeRecord, GradeStatus} from '../../models/grade-management.model';

export interface GradeRowSaveEvent {
  record: GradeRecord;
  score: number | null;
  comment: string | null;
}

@Component({
  selector: 'app-grade-student-row',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './grade-student-row.component.html',
  styleUrl: './grade-student-row.component.scss'
})
export class GradeStudentRowComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input({required: true}) record!: GradeRecord;
  @Input() disabled = false;
  @Output() saveRequested = new EventEmitter<GradeRowSaveEvent>();
  @Output() validateRequested = new EventEmitter<GradeRecord>();

  readonly form = this.fb.group({
    score: this.fb.control<number | null>(null, [Validators.min(0), Validators.max(20)]),
    comment: this.fb.nonNullable.control('', Validators.maxLength(280))
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['record'] && this.record) {
      this.form.reset({
        score: this.record.score,
        comment: this.record.comment ?? ''
      }, {emitEvent: false});
    }

    if (this.disabled || this.record?.status === 'PUBLISHED') {
      this.form.disable({emitEvent: false});
    } else {
      this.form.enable({emitEvent: false});
    }
  }

  get canValidate(): boolean {
    return !!this.record?.id
      && this.record.status !== 'VALIDATED'
      && this.record.status !== 'PUBLISHED'
      && this.form.valid
      && this.form.controls.score.value !== null;
  }

  statusTone(status: GradeStatus): string {
    const tones: Record<GradeStatus, string> = {
      NOT_GRADED: 'status-neutral',
      DRAFT: 'status-draft',
      VALIDATED: 'status-ready',
      PUBLISHED: 'status-published'
    };
    return tones[status];
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.saveRequested.emit({
      record: this.record,
      score: value.score,
      comment: value.comment.trim() || null
    });
  }
}
