import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DashboardAttendanceWidget } from '../../../../models/dashboard.model';

@Component({
  selector: 'app-attendance-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './attendance-widget.component.html',
  styleUrl: './attendance-widget.component.scss',
})
export class AttendanceWidgetComponent {
  @Input({ required: true }) widget!: DashboardAttendanceWidget;
}
