import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output, inject} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {AttendanceSlot, StartAttendanceSessionRequest} from '../../models/attendance.model';

@Component({
  selector: 'app-attendance-session-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './attendance-session-dialog.component.html',
  styleUrl: './attendance-session-dialog.component.scss'
})
export class AttendanceSessionDialogComponent {
  private readonly fb = inject(FormBuilder);

  @Input() visible = false;
  @Input() availableSlots: AttendanceSlot[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() started = new EventEmitter<StartAttendanceSessionRequest>();

  readonly form = this.fb.group({
    timetableEntryId: this.fb.nonNullable.control('', Validators.required),
    title: this.fb.nonNullable.control('')
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.started.emit({
      timetableEntryId: Number(value.timetableEntryId),
      title: value.title || null
    });
  }
}
