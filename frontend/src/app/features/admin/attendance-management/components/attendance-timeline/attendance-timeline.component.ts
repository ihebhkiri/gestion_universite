import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';
import {AttendanceRecord} from '../../models/attendance.model';

@Component({
  selector: 'app-attendance-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance-timeline.component.html',
  styleUrl: './attendance-timeline.component.scss'
})
export class AttendanceTimelineComponent {
  @Input() records: AttendanceRecord[] = [];

  get markedRecords(): AttendanceRecord[] {
    return this.records
      .filter(record => !!record.markedAt)
      .slice(-6)
      .reverse();
  }
}
