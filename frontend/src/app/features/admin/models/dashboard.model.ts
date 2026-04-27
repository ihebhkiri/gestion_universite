export interface AdminDashboardResponse {
  summary: DashboardSummary;
  enrollmentChart: EnrollmentChartPoint[];
  recentEnrollments: RecentEnrollment[];
  upcomingExams: UpcomingExam[];
  departmentStats: DepartmentStat[];
  activityFeed: ActivityFeedItem[];
  upcomingEvents: UpcomingEvent[];
  alerts: DashboardAlert[];
}

export interface DashboardSummary {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  attendanceRate: number | null;
  attendanceAvailable: boolean;
}

export interface EnrollmentChartPoint {
  label: string;
  value: number;
}

export interface RecentEnrollment {
  id: number;
  studentName: string;
  studentMatricule: string;
  groupName: string;
  status: string;
  enrollmentDate: string;
}

export interface UpcomingExam {
  title: string;
  courseName: string;
  startDate: string;
  endDate: string | null;
  daysUntil: number;
}

export interface DepartmentStat {
  id: number;
  code: string;
  name: string;
  teachers: number;
  programs: number;
}

export interface ActivityFeedItem {
  type: string;
  title: string;
  description: string;
  occurredAt: string;
}

export interface UpcomingEvent {
  title: string;
  description: string;
  date: string;
  kind: string;
}

export interface DashboardAlert {
  severity: 'warning' | 'info' | 'neutral' | 'critical';
  title: string;
  message: string;
}

export interface DashboardMetricCard {
  label: string;
  value: string;
  hint: string;
  icon: string;
  cardClass: string;
  iconClass: string;
  chipClass: string;
}

export interface DashboardPanelItem {
  title: string;
  subtitle: string;
  meta?: string;
  badge?: string;
  badgeClass?: string;
}

export interface DashboardChartBar {
  label: string;
  value: number;
  height: number;
  fillClass: string;
}

export interface DashboardDepartmentStatView {
  id: number;
  code: string;
  name: string;
  teachersLabel: string;
  programsLabel: string;
  width: number;
  progressClass: string;
}

export interface DashboardActivityItemView {
  title: string;
  description: string;
  occurredAtLabel: string;
  icon: string;
  iconClass: string;
  surfaceClass: string;
}

export interface DashboardRecentEnrollmentRow {
  id: number;
  studentName: string;
  matricule: string;
  groupName: string;
  status: string;
  statusClass: string;
  enrollmentDateLabel: string;
}

export interface DashboardAttendanceWidget {
  value: string;
  headline: string;
  description: string;
  trendLabel: string;
  trendClass: string;
  progressBackground: string;
  footnote: string;
}
