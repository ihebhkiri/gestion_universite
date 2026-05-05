import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ResultScoreChangeEvent, ResultStudentRecord} from '../result-ui.types';

@Component({
  selector: 'app-result-score-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './result-score-dialog.component.html',
  styleUrl: './result-score-dialog.component.scss'
})
export class ResultScoreDialogComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() visible = false;
  @Input() record: ResultStudentRecord | null = null;
  @Input() loading = false;
  @Output() closed = new EventEmitter<void>();
  @Output() scoreChanged = new EventEmitter<ResultScoreChangeEvent>();

  readonly form = this.fb.group({
    score: this.fb.control<number | null>(null, [Validators.min(0), Validators.max(20)]),
    comment: this.fb.nonNullable.control('', Validators.maxLength(320))
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['record']) {
      this.form.reset({
        score: this.currentScore,
        comment: this.record?.comment ?? this.record?.note ?? ''
      }, {emitEvent: false});
    }
  }

  get studentName(): string {
    return (this.record?.fullName
      ?? this.record?.studentName
      ?? `${this.record?.firstName ?? ''} ${this.record?.lastName ?? ''}`.trim())
      || 'Etudiant';
  }

  get currentScore(): number | null {
    return this.record?.score ?? this.record?.grade ?? this.record?.finalScore ?? this.record?.average ?? null;
  }

  submit(): void {
    if (!this.record) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.scoreChanged.emit({
      record: this.record,
      score: value.score,
      comment: value.comment.trim() || null
    });
  }
}
