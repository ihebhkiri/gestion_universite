import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/student-dashboard/student-dashboard.component').then(
        (m) => m.StudentDashboardComponent,
      ),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./pages/student-profile/student-profile.component').then(
        (m) => m.StudentProfileComponent,
      ),
  },
  {
    path: 'courses',
    loadComponent: () =>
      import('./pages/student-courses/student-courses.component').then(
        (m) => m.StudentCoursesComponent,
      ),
  },
  {
    path: 'timetable',
    loadComponent: () =>
      import('./pages/student-timetable/student-timetable.component').then(
        (m) => m.StudentTimetableComponent,
      ),
  },
  {
    path: 'results',
    loadComponent: () =>
      import('./pages/student-results/student-results.component').then(
        (m) => m.StudentResultsComponent,
      ),
  },
  {
    path: 'exams',
    loadComponent: () =>
      import('./pages/student-exams/student-exams.component').then(
        (m) => m.StudentExamsComponent,
      ),
  },
  {
    path: 'payments',
    loadComponent: () =>
      import('./pages/student-payments/student-payments.component').then(
        (m) => m.StudentPaymentsComponent,
      ),
  },
  {
    path: 'attendance',
    loadComponent: () =>
      import('./pages/student-attendance/student-attendance.component').then(
        (m) => m.StudentAttendanceComponent,
      ),
  },
  {
    path: 'announcements',
    loadComponent: () =>
      import('./pages/student-section-placeholder/student-section-placeholder.component').then(
        (m) => m.StudentSectionPlaceholderComponent,
      ),
    data: {
      title: 'Announcements',
      icon: 'campaign',
      description: 'Your university announcements and notices will appear here.',
    },
  },
  {
    path: 'documents',
    loadComponent: () =>
      import('./pages/student-section-placeholder/student-section-placeholder.component').then(
        (m) => m.StudentSectionPlaceholderComponent,
      ),
    data: {
      title: 'Documents',
      icon: 'folder',
      description: 'Your receipts, certificates, and academic documents will appear here.',
    },
  },
];
