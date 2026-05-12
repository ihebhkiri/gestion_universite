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
      import('./pages/student-section-placeholder/student-section-placeholder.component').then(
        (m) => m.StudentSectionPlaceholderComponent,
      ),
    data: {
      title: 'Courses',
      icon: 'menu_book',
      description: 'Your enrolled courses will appear here once the student course module is connected.',
    },
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
      import('./pages/student-section-placeholder/student-section-placeholder.component').then(
        (m) => m.StudentSectionPlaceholderComponent,
      ),
    data: {
      title: 'Results',
      icon: 'grade',
      description: 'Your published grades and academic performance details will appear here.',
    },
  },
  {
    path: 'exams',
    loadComponent: () =>
      import('./pages/student-section-placeholder/student-section-placeholder.component').then(
        (m) => m.StudentSectionPlaceholderComponent,
      ),
    data: {
      title: 'Exams',
      icon: 'quiz',
      description: 'Your exam schedule and exam details will appear here.',
    },
  },
  {
    path: 'payments',
    loadComponent: () =>
      import('./pages/student-section-placeholder/student-section-placeholder.component').then(
        (m) => m.StudentSectionPlaceholderComponent,
      ),
    data: {
      title: 'Payments',
      icon: 'payments',
      description: 'Your payment history, receipts, and fee status will appear here.',
    },
  },
  {
    path: 'attendance',
    loadComponent: () =>
      import('./pages/student-section-placeholder/student-section-placeholder.component').then(
        (m) => m.StudentSectionPlaceholderComponent,
      ),
    data: {
      title: 'Attendance',
      icon: 'fact_check',
      description: 'Your attendance summary and absence details will appear here.',
    },
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
