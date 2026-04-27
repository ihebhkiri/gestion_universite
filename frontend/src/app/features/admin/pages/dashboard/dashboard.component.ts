import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from '../../../../shared/components/admin/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/admin/header/header.component';
import { AdminService } from '../../services/admin.service';
import {
  AdminDashboardResponse,
  DashboardActivityItemView,
  DashboardAttendanceWidget,
  DashboardChartBar,
  DashboardDepartmentStatView,
  DashboardMetricCard,
  DashboardPanelItem,
  DashboardRecentEnrollmentRow,
} from '../../models/dashboard.model';
import { KpiCardsComponent } from './components/kpi-cards/kpi-cards.component';
import { EnrollmentChartComponent } from './components/enrollment-chart/enrollment-chart.component';
import { ActivityFeedComponent } from './components/activity-feed/activity-feed.component';
import { InfoPanelComponent } from './components/info-panel/info-panel.component';
import { RecentEnrollmentsTableComponent } from './components/recent-enrollments-table/recent-enrollments-table.component';
import { AttendanceWidgetComponent } from './components/attendance-widget/attendance-widget.component';

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
    InfoPanelComponent,
    RecentEnrollmentsTableComponent,
    AttendanceWidgetComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  dashboard: AdminDashboardResponse | null = null;
  metricCards: DashboardMetricCard[] = [];
  chartBars: DashboardChartBar[] = [];
  departmentStatCards: DashboardDepartmentStatView[] = [];
  activityItems: DashboardActivityItemView[] = [];
  recentEnrollmentRows: DashboardRecentEnrollmentRow[] = [];
  upcomingExamItems: DashboardPanelItem[] = [];
  upcomingEventItems: DashboardPanelItem[] = [];
  alertItems: DashboardPanelItem[] = [];
  attendanceWidget: DashboardAttendanceWidget = {
    value: 'N/A',
    headline: 'Attendance tracking pending',
    description: 'This executive widget is reserved for real attendance data when the attendance domain is connected.',
    trendLabel: 'Unavailable',
    trendClass: 'bg-slate-100 text-slate-600',
    progressBackground: 'conic-gradient(#e2e8f0 0deg, #e2e8f0 360deg)',
    footnote: 'Attendance is not exposed by the current backend, so the dashboard stays transparent instead of showing guessed numbers.',
  };
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
        this.chartBars = this.buildChartBars(dashboard);
        this.departmentStatCards = this.buildDepartmentStats(dashboard);
        this.activityItems = this.buildActivityItems(dashboard);
        this.recentEnrollmentRows = dashboard.recentEnrollments.map((item) => ({
          id: item.id,
          studentName: item.studentName,
          matricule: item.studentMatricule,
          groupName: item.groupName,
          status: item.status,
          statusClass: item.status === 'ACTIVE'
            ? 'bg-emerald-100 text-emerald-700'
            : 'bg-amber-100 text-amber-700',
          enrollmentDateLabel: this.formatDate(item.enrollmentDate),
        }));
        this.upcomingExamItems = dashboard.upcomingExams.map((item) => ({
          title: item.title,
          subtitle: item.courseName,
          meta: `${this.formatDate(item.startDate)}${item.endDate ? ` to ${this.formatDate(item.endDate)}` : ''}`,
          badge: item.daysUntil === 0 ? 'Today' : `D-${item.daysUntil}`,
          badgeClass: item.daysUntil <= 7
            ? 'bg-amber-100 text-amber-700'
            : 'bg-blue-100 text-blue-700',
        }));
        this.upcomingEventItems = dashboard.upcomingEvents.map((item) => ({
          title: item.title,
          subtitle: item.description,
          meta: this.formatDate(item.date),
          badge: this.formatKind(item.kind),
          badgeClass: 'bg-sky-100 text-sky-700',
        }));
        this.alertItems = dashboard.alerts.map((item) => ({
          title: item.title,
          subtitle: item.message,
          badge: item.severity.toUpperCase(),
          badgeClass: this.mapSeverity(item.severity),
        }));
        this.attendanceWidget = this.buildAttendanceWidget(dashboard);
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
        hint: 'Registered learners across the institution',
        icon: 'school',
        cardClass: 'border-white/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.96),rgba(232,244,255,0.96))]',
        iconClass: 'bg-blue-100 text-blue-700',
        chipClass: 'bg-blue-100 text-blue-700',
      },
      {
        label: 'Total Teachers',
        value: dashboard.summary.totalTeachers.toString(),
        hint: 'Active teaching staff in the academic roster',
        icon: 'co_present',
        cardClass: 'border-white/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.96),rgba(236,253,245,0.96))]',
        iconClass: 'bg-emerald-100 text-emerald-700',
        chipClass: 'bg-emerald-100 text-emerald-700',
      },
      {
        label: 'Total Courses',
        value: dashboard.summary.totalCourses.toString(),
        hint: 'Published course units available to schedule',
        icon: 'menu_book',
        cardClass: 'border-white/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.96),rgba(255,247,237,0.96))]',
        iconClass: 'bg-amber-100 text-amber-700',
        chipClass: 'bg-amber-100 text-amber-700',
      },
      {
        label: 'Attendance %',
        value: dashboard.summary.attendanceAvailable && dashboard.summary.attendanceRate !== null
          ? `${dashboard.summary.attendanceRate}%`
          : 'N/A',
        hint: dashboard.summary.attendanceAvailable ? 'Live attendance coverage' : 'Awaiting attendance integration',
        icon: 'fact_check',
        cardClass: 'border-white/70 bg-[linear-gradient(160deg,rgba(255,255,255,0.96),rgba(241,245,249,0.96))]',
        iconClass: 'bg-slate-200 text-slate-700',
        chipClass: 'bg-slate-200 text-slate-700',
      },
    ];
  }

  private buildChartBars(dashboard: AdminDashboardResponse): DashboardChartBar[] {
    const palette = [
      'bg-[linear-gradient(180deg,#38bdf8_0%,#2563eb_100%)]',
      'bg-[linear-gradient(180deg,#34d399_0%,#059669_100%)]',
      'bg-[linear-gradient(180deg,#fbbf24_0%,#f97316_100%)]',
      'bg-[linear-gradient(180deg,#a78bfa_0%,#7c3aed_100%)]',
      'bg-[linear-gradient(180deg,#f472b6_0%,#db2777_100%)]',
      'bg-[linear-gradient(180deg,#22c55e_0%,#15803d_100%)]',
    ];
    const maxValue = Math.max(...dashboard.enrollmentChart.map((point) => point.value), 1);

    return dashboard.enrollmentChart.map((point, index) => ({
      label: point.label,
      value: point.value,
      height: Math.max((point.value / maxValue) * 100, point.value > 0 ? 16 : 4),
      fillClass: palette[index % palette.length],
    }));
  }

  private buildDepartmentStats(dashboard: AdminDashboardResponse): DashboardDepartmentStatView[] {
    const sortedDepartments = [...dashboard.departmentStats]
      .sort((left, right) => right.teachers - left.teachers || right.programs - left.programs)
      .slice(0, 4);
    const maxTeachers = Math.max(...sortedDepartments.map((department) => department.teachers), 1);
    const palette = [
      'bg-[linear-gradient(90deg,#0ea5e9_0%,#2563eb_100%)]',
      'bg-[linear-gradient(90deg,#10b981_0%,#047857_100%)]',
      'bg-[linear-gradient(90deg,#f59e0b_0%,#ea580c_100%)]',
      'bg-[linear-gradient(90deg,#8b5cf6_0%,#7c3aed_100%)]',
    ];

    return sortedDepartments.map((department, index) => ({
      id: department.id,
      code: department.code,
      name: department.name,
      teachersLabel: `${department.teachers} teachers`,
      programsLabel: `${department.programs} programs`,
      width: Math.max((department.teachers / maxTeachers) * 100, department.teachers > 0 ? 18 : 8),
      progressClass: palette[index % palette.length],
    }));
  }

  private buildActivityItems(dashboard: AdminDashboardResponse): DashboardActivityItemView[] {
    return dashboard.activityFeed.map((item) => ({
      title: item.title,
      description: item.description,
      occurredAtLabel: this.formatDateTime(item.occurredAt),
      icon: item.type === 'teacher' ? 'co_present' : item.type === 'exam' ? 'assignment' : 'how_to_reg',
      iconClass: item.type === 'teacher'
        ? 'text-emerald-300'
        : item.type === 'exam'
          ? 'text-amber-300'
          : 'text-cyan-300',
      surfaceClass: item.type === 'teacher'
        ? 'bg-emerald-400/15'
        : item.type === 'exam'
          ? 'bg-amber-400/15'
          : 'bg-cyan-400/15',
    }));
  }

  private buildAttendanceWidget(dashboard: AdminDashboardResponse): DashboardAttendanceWidget {
    if (!dashboard.summary.attendanceAvailable || dashboard.summary.attendanceRate === null) {
      return {
        value: 'N/A',
        headline: 'Attendance tracking pending',
        description: 'This executive widget is reserved for real attendance data when the attendance domain is connected.',
        trendLabel: 'Unavailable',
        trendClass: 'bg-slate-100 text-slate-600',
        progressBackground: 'conic-gradient(#e2e8f0 0deg, #e2e8f0 360deg)',
        footnote: 'Attendance is not exposed by the current backend, so the dashboard stays transparent instead of showing guessed numbers.',
      };
    }

    const percentage = Math.max(0, Math.min(dashboard.summary.attendanceRate, 100));
    const degrees = (percentage / 100) * 360;

    return {
      value: `${percentage}%`,
      headline: 'Attendance performance',
      description: 'Executive attendance coverage for the monitored academic period.',
      trendLabel: percentage >= 90 ? 'Healthy' : percentage >= 75 ? 'Watch' : 'Critical',
      trendClass: percentage >= 90
        ? 'bg-emerald-100 text-emerald-700'
        : percentage >= 75
          ? 'bg-amber-100 text-amber-700'
          : 'bg-rose-100 text-rose-700',
      progressBackground: `conic-gradient(#0f172a 0deg, #0f172a ${degrees}deg, #e2e8f0 ${degrees}deg, #e2e8f0 360deg)`,
      footnote: 'Attendance data is connected and being summarized from operational records.',
    };
  }

  private mapSeverity(severity: string): string {
    if (severity === 'warning') {
      return 'bg-amber-100 text-amber-700';
    }

    if (severity === 'critical') {
      return 'bg-rose-100 text-rose-700';
    }

    if (severity === 'info') {
      return 'bg-blue-100 text-blue-700';
    }

    return 'bg-slate-200 text-slate-700';
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

  private formatDateTime(value: string): string {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  }
}
