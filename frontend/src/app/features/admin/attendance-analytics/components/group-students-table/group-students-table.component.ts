import {CommonModule} from '@angular/common';
import {animate, query, stagger, style, transition, trigger} from '@angular/animations';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AttendanceRiskLevel, GroupStudentAttendance} from '../../models/attendance-analytics.model';

@Component({
  selector: 'app-group-students-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './group-students-table.component.html',
  animations: [
    trigger('studentRowsEnter', [
      transition('* => *', [
        query('tbody tr', [
          style({opacity: 0, transform: 'translateX(-10px)'}),
          stagger(24, animate('260ms ease-out', style({opacity: 1, transform: 'translateX(0)'})))
        ], {optional: true})
      ])
    ])
  ]
})
export class GroupStudentsTableComponent {
  @Input() students: GroupStudentAttendance[] = [];
  @Output() studentSelected = new EventEmitter<number>();

  riskClass(riskLevel: AttendanceRiskLevel): string {
    if (riskLevel === 'HIGH') return 'risk-high';
    if (riskLevel === 'MEDIUM') return 'risk-medium';
    return 'risk-low';
  }
}
