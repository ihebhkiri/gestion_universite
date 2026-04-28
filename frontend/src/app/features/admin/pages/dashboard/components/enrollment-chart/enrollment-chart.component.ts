import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DashboardChartBar, DashboardDepartmentStatView } from '../../../../models/dashboard.model';

@Component({
  selector: 'app-enrollment-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './enrollment-chart.component.html',
  styleUrl: './enrollment-chart.component.scss',
})
export class EnrollmentChartComponent {
  @Input({ required: true }) bars: DashboardChartBar[] = [];
  @Input({ required: true }) departments: DashboardDepartmentStatView[] = [];
}
