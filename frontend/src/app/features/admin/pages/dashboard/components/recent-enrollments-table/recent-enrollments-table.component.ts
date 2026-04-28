import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DashboardRecentEnrollmentRow } from '../../../../models/dashboard.model';

@Component({
  selector: 'app-recent-enrollments-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recent-enrollments-table.component.html',
  styleUrl: './recent-enrollments-table.component.scss',
})
export class RecentEnrollmentsTableComponent {
  @Input({ required: true }) rows: DashboardRecentEnrollmentRow[] = [];
}
