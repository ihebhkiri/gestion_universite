import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {HeaderComponent} from '../../../../../shared/components/admin/header/header.component';
import {SidebarComponent} from '../../../../../shared/components/admin/sidebar/sidebar.component';
import {AttendanceHeaderComponent} from '../../components/attendance-header/attendance-header.component';
import {AttendanceSessionDialogComponent} from '../../components/attendance-session-dialog/attendance-session-dialog.component';
import {AttendanceStatsComponent} from '../../components/attendance-stats/attendance-stats.component';
import {AttendanceStudentListComponent} from '../../components/attendance-student-list/attendance-student-list.component';
import {AttendanceTimelineComponent} from '../../components/attendance-timeline/attendance-timeline.component';
import {AttendanceRecord, AttendanceStatus, StartAttendanceSessionRequest} from '../../models/attendance.model';
import {AttendanceFacade} from '../../facades/attendance.facade';
import {AttendanceStateService} from '../../services/attendance-state.service';

@Component({
  selector: 'app-attendance-session-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SidebarComponent,
    HeaderComponent,
    AttendanceHeaderComponent,
    AttendanceSessionDialogComponent,
    AttendanceStatsComponent,
    AttendanceStudentListComponent,
    AttendanceTimelineComponent
  ],
  providers: [AttendanceFacade, AttendanceStateService],
  templateUrl: './attendance-session-page.component.html',
  styleUrl: './attendance-session-page.component.scss'
})
export class AttendanceSessionPageComponent implements OnInit {
  dialogOpen = false;

  constructor(public readonly facade: AttendanceFacade) {}

  ngOnInit(): void {
    this.facade.init();
  }

  openDialog(): void {
    this.facade.refreshAvailableSlots();
    this.dialogOpen = true;
  }

  closeDialog(): void {
    this.dialogOpen = false;
  }

  startSession(request: StartAttendanceSessionRequest): void {
    this.facade.startSession(request);
    this.closeDialog();
  }

  updateStatus(event: {record: AttendanceRecord; status: AttendanceStatus}): void {
    this.facade.updateStudentStatus(event.record, event.status);
  }
}
