import { Component } from '@angular/core';
import { StudentAgendaComponent } from '../../components/student-agenda/student-agenda.component';
import { StudentSidePanelComponent } from '../../components/student-side-panel/student-side-panel.component';
import { StudentHeaderComponent } from '../../../../shared/students/student-header/student-header.component';
import { StudentCoursesPreviewCardComponent } from '../../components/dashboard-cards/student-courses-preview-card/student-courses-preview-card.component';
import { StudentResultsPreviewCardComponent } from '../../components/dashboard-cards/student-results-preview-card/student-results-preview-card.component';
import { StudentAttendancePreviewCardComponent } from '../../components/dashboard-cards/student-attendance-preview-card/student-attendance-preview-card.component';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    StudentHeaderComponent,
    StudentAgendaComponent,
    StudentCoursesPreviewCardComponent,
    StudentResultsPreviewCardComponent,
    StudentAttendancePreviewCardComponent,
    StudentSidePanelComponent,
  ],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.scss',
})
export class StudentDashboardComponent {
}
