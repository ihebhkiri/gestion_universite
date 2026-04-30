import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';
import {AttendanceSummary} from '../../models/attendance.model';

@Component({
  selector: 'app-attendance-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance-stats.component.html',
  styleUrl: './attendance-stats.component.scss'
})
export class AttendanceStatsComponent {
  @Input({required: true}) stats!: AttendanceSummary;
}
