import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AttendanceSession} from '../../models/attendance.model';

@Component({
  selector: 'app-attendance-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance-header.component.html',
  styleUrl: './attendance-header.component.scss'
})
export class AttendanceHeaderComponent {
  @Input({required: true}) session!: AttendanceSession;
  @Output() startRequested = new EventEmitter<void>();
  @Output() closeRequested = new EventEmitter<void>();

  get qrCells(): number[] {
    return Array.from({length: 25}, (_, index) => index);
  }
}
