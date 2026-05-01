import {CommonModule} from '@angular/common';
import {animate, query, stagger, style, transition, trigger} from '@angular/animations';
import {Component, OnInit} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {HeaderComponent} from '../../../../../shared/components/admin/header/header.component';
import {SidebarComponent} from '../../../../../shared/components/admin/sidebar/sidebar.component';
import {AnalyticsFiltersComponent} from '../../components/analytics-filters/analytics-filters.component';
import {CourseAbsenceRankingComponent} from '../../components/course-absence-ranking/course-absence-ranking.component';
import {GroupStudentsTableComponent} from '../../components/group-students-table/group-students-table.component';
import {GroupSummaryCardsComponent} from '../../components/group-summary-cards/group-summary-cards.component';
import {StudentAttendanceDialogComponent} from '../../components/student-attendance-dialog/student-attendance-dialog.component';
import {TeacherAbsenceRankingComponent} from '../../components/teacher-absence-ranking/teacher-absence-ranking.component';
import {AttendanceAnalyticsFacade} from '../../facades/attendance-analytics.facade';
import {AttendanceAnalyticsStateService} from '../../services/attendance-analytics-state.service';

@Component({
  selector: 'app-attendance-analytics-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SidebarComponent,
    HeaderComponent,
    AnalyticsFiltersComponent,
    GroupSummaryCardsComponent,
    GroupStudentsTableComponent,
    CourseAbsenceRankingComponent,
    TeacherAbsenceRankingComponent,
    StudentAttendanceDialogComponent
  ],
  providers: [AttendanceAnalyticsFacade, AttendanceAnalyticsStateService],
  templateUrl: './attendance-analytics-page.component.html',
  styleUrl: './attendance-analytics-page.component.scss',
  animations: [
    trigger('analyticsPageEnter', [
      transition(':enter', [
        query('.analytics-animate', [
          style({opacity: 0, transform: 'translateY(18px)'}),
          stagger(70, animate('360ms cubic-bezier(0.2, 0, 0, 1)', style({opacity: 1, transform: 'translateY(0)'})))
        ], {optional: true})
      ])
    ])
  ]
})
export class AttendanceAnalyticsPageComponent implements OnInit {
  constructor(public readonly facade: AttendanceAnalyticsFacade) {}

  ngOnInit(): void {
    this.facade.init();
  }
}
