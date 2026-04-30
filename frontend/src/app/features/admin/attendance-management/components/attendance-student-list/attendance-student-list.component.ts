import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AttendanceRecord, AttendanceStatus} from '../../models/attendance.model';
import {AttendanceStudentCardComponent} from '../attendance-student-card/attendance-student-card.component';

@Component({
  selector: 'app-attendance-student-list',
  standalone: true,
  imports: [CommonModule, AttendanceStudentCardComponent],
  templateUrl: './attendance-student-list.component.html',
  styleUrl: './attendance-student-list.component.scss'
})
export class AttendanceStudentListComponent {
  @Input() records: AttendanceRecord[] = [];
  @Input() disabled = false;
  @Output() statusChanged = new EventEmitter<{record: AttendanceRecord; status: AttendanceStatus}>();
}
