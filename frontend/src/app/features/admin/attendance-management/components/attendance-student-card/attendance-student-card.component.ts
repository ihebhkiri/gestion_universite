import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AttendanceRecord, AttendanceStatus} from '../../models/attendance.model';

@Component({
  selector: 'app-attendance-student-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance-student-card.component.html',
  styleUrl: './attendance-student-card.component.scss'
})
export class AttendanceStudentCardComponent {
  @Input({required: true}) record!: AttendanceRecord;
  @Input() disabled = false;
  @Output() statusChanged = new EventEmitter<AttendanceStatus>();

  readonly statuses: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

  statusIcon(status: AttendanceStatus): string {
    const icons: Record<AttendanceStatus, string> = {
      PRESENT: 'check_circle',
      ABSENT: 'cancel',
      LATE: 'schedule',
      EXCUSED: 'verified'
    };
    return icons[status];
  }
}
