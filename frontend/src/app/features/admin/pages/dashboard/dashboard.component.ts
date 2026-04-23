import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {SidebarComponent} from '../../../../shared/components/admin/sidebar/sidebar.component';
import {HeaderComponent} from '../../../../shared/components/admin/header/header.component';
import { AdminService } from '../../services/admin.service';
import {
  AdminDashboardResponse,
  DashboardMetricCard,
  DashboardPanelItem,
} from '../../models/dashboard.model';
import { KpiCardsComponent } from './components/kpi-cards/kpi-cards.component';
import { EnrollmentChartComponent } from './components/enrollment-chart/enrollment-chart.component';
import { ActivityFeedComponent } from './components/activity-feed/activity-feed.component';
import { InfoPanelComponent } from './components/info-panel/info-panel.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    HeaderComponent,
    KpiCardsComponent,
    EnrollmentChartComponent,
    ActivityFeedComponent,
    InfoPanelComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  dashboard: AdminDashboardResponse | null = null;
  metricCards: DashboardMetricCard[] = [];
  recentEnrollmentItems: DashboardPanelItem[] = [];
  upcomingExamItems: DashboardPanelItem[] = [];
  upcomingEventItems: DashboardPanelItem[] = [];
  alertItems: DashboardPanelItem[] = [];
  loading = true;
  errorMessage = '';

  constructor(private readonly adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    this.adminService.getDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard = dashboard;
        this.metricCards = this.buildMetricCards(dashboard);
        this.recentEnrollmentItems = dashboard.recentEnrollments.map((item) => ({
          title: item.studentName,
          subtitle: `${item.groupName} · ${item.studentMatricule}`,
          meta: this.formatDate(item.enrollmentDate),
          badge: item.status,
          badgeTone: item.status === 'ACTIVE' ? 'green' : 'amber',
        }));
        this.upcomingExamItems = dashboard.upcomingExams.map((item) => ({
          title: item.title,
          subtitle: item.courseName,
          meta: `${this.formatDate(item.startDate)}${item.endDate ? ` to ${this.formatDate(item.endDate)}` : ''}`,
          badge: item.daysUntil === 0 ? 'Today' : `D-${item.daysUntil}`,
          badgeTone: item.daysUntil <= 7 ? 'amber' : 'blue',
        }));
        this.upcomingEventItems = dashboard.upcomingEvents.map((item) => ({
          title: item.title,
          subtitle: item.description,
          meta: this.formatDate(item.date),
          badge: this.formatKind(item.kind),
          badgeTone: 'blue',
        }));
        this.alertItems = dashboard.alerts.map((item) => ({
          title: item.title,
          subtitle: item.message,
          badge: item.severity.toUpperCase(),
          badgeTone: this.mapSeverity(item.severity),
        }));
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load dashboard data right now.';
        this.loading = false;
      }
    });
  }

  private buildMetricCards(dashboard: AdminDashboardResponse): DashboardMetricCard[] {
    return [
      {
        label: 'Total Students',
        value: dashboard.summary.totalStudents.toString(),
        hint: 'Registered learners',
        icon: 'school',
        tone: 'blue',
      },
      {
        label: 'Total Teachers',
        value: dashboard.summary.totalTeachers.toString(),
        hint: 'Active teaching staff',
        icon: 'person',
        tone: 'green',
      },
      {
        label: 'Total Courses',
        value: dashboard.summary.totalCourses.toString(),
        hint: 'Published course units',
        icon: 'menu_book',
        tone: 'amber',
      },
      {
        label: 'Attendance %',
        value: dashboard.summary.attendanceAvailable && dashboard.summary.attendanceRate !== null
          ? `${dashboard.summary.attendanceRate}%`
          : 'N/A',
        hint: dashboard.summary.attendanceAvailable ? 'Live attendance rate' : 'Attendance module pending',
        icon: 'fact_check',
        tone: 'slate',
      },
    ];
  }

  private mapSeverity(severity: string): DashboardPanelItem['badgeTone'] {
    if (severity === 'warning') {
      return 'amber';
    }

    if (severity === 'critical') {
      return 'red';
    }

    if (severity === 'info') {
      return 'blue';
    }

    return 'slate';
  }

  private formatKind(kind: string): string {
    return kind.replace('-', ' ');
  }

  private formatDate(value: string): string {
    const normalizedValue = value.length === 10 ? `${value}T00:00:00` : value;

    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(normalizedValue));
  }

}
