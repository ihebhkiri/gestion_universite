import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {HeaderComponent} from '../../../../../shared/components/admin/header/header.component';
import {SidebarComponent} from '../../../../../shared/components/admin/sidebar/sidebar.component';
import {ExamCalendarComponent} from '../../components/exam-calendar/exam-calendar.component';
import {ExamConflictPanelComponent} from '../../components/exam-conflict-panel/exam-conflict-panel.component';
import {ExamDaySnapshotComponent} from '../../components/exam-day-snapshot/exam-day-snapshot.component';
import {ExamDialogComponent} from '../../components/exam-dialog/exam-dialog.component';
import {ExamFiltersComponent} from '../../components/exam-filters/exam-filters.component';
import {ExamSummaryCardsComponent} from '../../components/exam-summary-cards/exam-summary-cards.component';
import {ExamTableComponent} from '../../components/exam-table/exam-table.component';
import {ExamFacade} from '../../facades/exam.facade';
import {ExamStateService} from '../../services/exam-state.service';

@Component({
  selector: 'app-exam-management-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SidebarComponent,
    HeaderComponent,
    ExamCalendarComponent,
    ExamConflictPanelComponent,
    ExamDaySnapshotComponent,
    ExamDialogComponent,
    ExamFiltersComponent,
    ExamSummaryCardsComponent,
    ExamTableComponent
  ],
  providers: [ExamStateService, ExamFacade],
  templateUrl: './exam-management-page.component.html',
  styleUrl: './exam-management-page.component.scss'
})
export class ExamManagementPageComponent implements OnInit {
  constructor(public readonly facade: ExamFacade) {}

  ngOnInit(): void {
    this.facade.loadReferenceData();
    this.facade.loadExams();
  }
}
