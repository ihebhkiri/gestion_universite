import { Component } from '@angular/core';
import { StudentAgendaComponent } from '../../components/student-agenda/student-agenda.component';
import { StudentPreviewCardComponent } from '../../components/student-preview-card/student-preview-card.component';
import { StudentSidePanelComponent } from '../../components/student-side-panel/student-side-panel.component';
import {
  StudentAgendaItem,
  StudentExamItem,
  StudentPreviewCard,
} from '../../models/student-dashboard.models';
import { StudentHeaderComponent } from '../../../../shared/students/student-header/student-header.component';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    StudentHeaderComponent,
    StudentAgendaComponent,
    StudentPreviewCardComponent,
    StudentSidePanelComponent,
  ],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.scss',
})
export class StudentDashboardComponent {
  readonly previewCards: StudentPreviewCard[] = [
    {
      title: 'Courses',
      icon: 'menu_book',
      route: '/students/courses',
      emptyStateText: 'No enrolled courses yet.',
      items: [
        { title: 'Data Structures', subtitle: 'Prof. Sarah Jenkins', meta: '4 credits', status: 'Active' },
        { title: 'Algorithm Analysis', subtitle: 'Dr. Aris Thorne', meta: '3 credits', status: 'Active' },
        { title: 'Software Engineering Lab', subtitle: 'Workshop Area C', meta: '2 credits', status: 'Mandatory' },
        { title: 'Database Management', subtitle: 'Room 108', meta: '4 credits', status: 'Active' },
        { title: 'Discrete Mathematics', subtitle: 'Great Hall', meta: '3 credits', status: 'Active' },
      ],
    },
    {
      title: 'Results',
      icon: 'grade',
      route: '/students/results',
      emptyStateText: 'No published results yet.',
      items: [
        { title: 'Data Structures - Quiz 2', subtitle: 'Submitted Oct 20', meta: '94/100', status: 'Above Average' },
        { title: 'Algorithm Analysis - Midterm', subtitle: 'Submitted Oct 15', meta: '88/100', status: 'B+' },
        { title: 'Database Management - Lab', subtitle: 'Submitted Oct 10', meta: '91/100', status: 'A-' },
        { title: 'Discrete Mathematics - Assignment', subtitle: 'Submitted Oct 04', meta: '17/20', status: 'Passed' },
        { title: 'Software Engineering - Sprint Review', subtitle: 'Submitted Sep 29', meta: '18/20', status: 'Passed' },
      ],
    },
    {
      title: 'Payments',
      icon: 'payments',
      route: '/students/payments',
      emptyStateText: 'No payment activity yet.',
      items: [
        { title: 'Semester Tuition Fee - Fall 2024', subtitle: '#TXN-90211', amount: '$4,250.00', date: 'Sep 12', status: 'Processed' },
        { title: 'Campus Lab Access Pass', subtitle: '#TXN-88420', amount: '$75.00', date: 'Aug 28', status: 'Processed' },
        { title: 'Library Access Renewal', subtitle: '#TXN-86108', amount: '$35.00', date: 'Aug 12', status: 'Processed' },
        { title: 'Registration Deposit', subtitle: '#TXN-84002', amount: '$500.00', date: 'Jul 30', status: 'Processed' },
        { title: 'Student Card Replacement', subtitle: '#TXN-82941', amount: '$15.00', date: 'Jul 18', status: 'Processed' },
      ],
    },
    {
      title: 'Announcements',
      icon: 'campaign',
      route: '/students/announcements',
      emptyStateText: 'No recent announcements.',
      items: [
        { title: 'Winter Semester Registration', subtitle: 'Academic Affairs', meta: 'Nov 15', status: 'Pinned' },
        { title: 'Database Lab Room Change', subtitle: 'Computer Science Department', meta: 'Today', status: 'New' },
        { title: 'Library Hours Extended', subtitle: 'Campus Services', meta: 'Oct 23' },
        { title: 'Career Fair Registration', subtitle: 'Student Office', meta: 'Oct 21' },
        { title: 'Exam Rules Reminder', subtitle: 'Academic Affairs', meta: 'Oct 20' },
      ],
    },
    {
      title: 'Documents',
      icon: 'folder',
      route: '/students/documents',
      emptyStateText: 'No available documents.',
      items: [
        { title: 'Tuition Receipt - Fall 2024', subtitle: 'PDF document', date: 'Sep 12', status: 'Ready' },
        { title: 'Enrollment Certificate', subtitle: 'Academic year 2024/2025', date: 'Sep 01', status: 'Ready' },
        { title: 'Student Card Proof', subtitle: 'Administrative document', date: 'Aug 30', status: 'Ready' },
        { title: 'Lab Access Receipt', subtitle: 'PDF document', date: 'Aug 28', status: 'Ready' },
        { title: 'Medical Form Validation', subtitle: 'Health office', date: 'Aug 18', status: 'Validated' },
      ],
    },
  ];

  readonly agendaItems: StudentAgendaItem[] = [
    {
      startTime: '09:00',
      duration: '60 MIN',
      title: 'Algorithm Analysis',
      meta: 'Dr. Aris Thorne - Lecture Hall B',
      state: 'past',
    },
    {
      startTime: '10:00',
      duration: '90 MIN',
      title: 'Data Structures',
      meta: 'Prof. Sarah Jenkins - Room 402',
      state: 'current',
    },
    {
      startTime: '13:30',
      duration: '120 MIN',
      title: 'Software Engineering Lab',
      meta: 'Workshop Area C - Mandatory',
      state: 'upcoming',
    },
  ];

  readonly exams: StudentExamItem[] = [
    {
      month: 'Oct',
      day: '28',
      title: 'Discrete Mathematics',
      meta: '09:00 AM - Great Hall',
    },
    {
      month: 'Nov',
      day: '02',
      title: 'Database Management',
      meta: '02:00 PM - Room 108',
    },
  ];




}
