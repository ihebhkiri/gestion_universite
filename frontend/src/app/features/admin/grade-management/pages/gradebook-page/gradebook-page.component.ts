import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {animate, style, transition, trigger} from '@angular/animations';
import {HeaderComponent} from '../../../../../shared/components/admin/header/header.component';
import {SidebarComponent} from '../../../../../shared/components/admin/sidebar/sidebar.component';
import {ExamDialogComponent} from '../../components/exam-dialog/exam-dialog.component';
import {GradeDistributionComponent} from '../../components/grade-distribution/grade-distribution.component';
import {GradePublishDialogComponent} from '../../components/grade-publish-dialog/grade-publish-dialog.component';
import {GradeStatsComponent} from '../../components/grade-stats/grade-stats.component';
import {GradeStudentListComponent} from '../../components/grade-student-list/grade-student-list.component';
import {GradeRowSaveEvent} from '../../components/grade-student-row/grade-student-row.component';
import {GradebookHeaderComponent} from '../../components/gradebook-header/gradebook-header.component';
import {CreateExamPayload, GradeRecord} from '../../models/grade-management.model';
import {GradeManagementFacade} from '../../facades/grade-management.facade';
import {GradeManagementStateService} from '../../services/grade-management-state.service';

@Component({
  selector: 'app-gradebook-page',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    HeaderComponent,
    GradebookHeaderComponent,
    GradeStatsComponent,
    GradeStudentListComponent,
    GradeDistributionComponent,
    ExamDialogComponent,
    GradePublishDialogComponent
  ],
  providers: [GradeManagementStateService, GradeManagementFacade],
  templateUrl: './gradebook-page.component.html',
  styleUrl: './gradebook-page.component.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({opacity: 0, transform: 'translateY(12px)'}),
        animate('220ms ease-out', style({opacity: 1, transform: 'translateY(0)'}))
      ])
    ])
  ]
})
export class GradebookPageComponent implements OnInit {
  examDialogOpen = false;
  publishDialogOpen = false;

  constructor(public readonly facade: GradeManagementFacade) {}

  ngOnInit(): void {
    this.facade.loadReferenceData();
  }

  openExamDialog(): void {
    this.examDialogOpen = true;
  }

  closeExamDialog(): void {
    this.examDialogOpen = false;
  }

  createExam(payload: CreateExamPayload): void {
    this.facade.createExam(payload);
    this.closeExamDialog();
  }

  openPublishDialog(): void {
    this.publishDialogOpen = true;
  }

  closePublishDialog(): void {
    this.publishDialogOpen = false;
  }

  publishExam(examId: number): void {
    this.facade.publishExam(examId);
    this.closePublishDialog();
  }

  saveGrade(event: GradeRowSaveEvent): void {
    this.facade.updateGrade(event.record.id, {
      score: event.score,
      comment: event.comment,
      status: 'DRAFT'
    });
  }

  validateGrade(record: GradeRecord): void {
    this.facade.validateGrade(record.id);
  }
}
