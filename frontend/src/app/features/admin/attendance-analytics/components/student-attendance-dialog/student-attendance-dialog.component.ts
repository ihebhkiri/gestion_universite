import {CommonModule} from '@angular/common';
import {animate, query, stagger, style, transition, trigger} from '@angular/animations';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AttendanceAnalyticsStatus, StudentAttendanceProfile} from '../../models/attendance-analytics.model';

@Component({
  selector: 'app-student-attendance-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-attendance-dialog.component.html',
  animations: [
    trigger('dialogBackdrop', [
      transition(':enter', [
        style({opacity: 0}),
        animate('180ms ease-out', style({opacity: 1}))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({opacity: 0}))
      ])
    ]),
    trigger('studentDrawer', [
      transition(':enter', [
        style({opacity: 0, transform: 'translateX(42px)'}),
        animate('280ms cubic-bezier(0.2, 0, 0, 1)', style({opacity: 1, transform: 'translateX(0)'})),
        query('.dialog-animate', [
          style({opacity: 0, transform: 'translateY(12px)'}),
          stagger(45, animate('260ms ease-out', style({opacity: 1, transform: 'translateY(0)'})))
        ], {optional: true})
      ]),
      transition(':leave', [
        animate('180ms ease-in', style({opacity: 0, transform: 'translateX(42px)'}))
      ])
    ])
  ]
})
export class StudentAttendanceDialogComponent {
  @Input() profile: StudentAttendanceProfile | null = null;
  @Output() closed = new EventEmitter<void>();

  statusClass(status: AttendanceAnalyticsStatus): string {
    if (status === 'PRESENT') return 'status-present';
    if (status === 'ABSENT') return 'status-absent';
    if (status === 'LATE') return 'status-late';
    return 'status-excused';
  }
}
