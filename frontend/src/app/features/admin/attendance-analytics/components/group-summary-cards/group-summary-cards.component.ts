import {CommonModule} from '@angular/common';
import {animate, query, stagger, style, transition, trigger} from '@angular/animations';
import {Component, Input} from '@angular/core';
import {GroupAttendanceSummary} from '../../models/attendance-analytics.model';

interface SummaryCard {
  label: string;
  value: string;
  hint: string;
  icon: string;
  tone: string;
}

@Component({
  selector: 'app-group-summary-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './group-summary-cards.component.html',
  animations: [
    trigger('kpiCardsEnter', [
      transition('* => *', [
        query('.analytics-card', [
          style({opacity: 0, transform: 'translateY(14px) scale(0.98)'}),
          stagger(55, animate('320ms cubic-bezier(0.2, 0, 0, 1)', style({opacity: 1, transform: 'translateY(0) scale(1)'})))
        ], {optional: true})
      ])
    ])
  ]
})
export class GroupSummaryCardsComponent {
  @Input() summary: GroupAttendanceSummary | null = null;

  get cards(): SummaryCard[] {
    const summary = this.summary;
    return [
      {
        label: 'Total Students',
        value: `${summary?.totalStudents ?? 0}`,
        hint: `${summary?.totalRecords ?? 0} attendance records`,
        icon: 'groups',
        tone: 'blue'
      },
      {
        label: 'Total Sessions',
        value: `${summary?.totalSessions ?? 0}`,
        hint: 'Closed and open sessions',
        icon: 'event_available',
        tone: 'slate'
      },
      {
        label: 'Presence Rate',
        value: `${summary?.presenceRate ?? 0}%`,
        hint: `${summary?.presentCount ?? 0} present + ${summary?.lateCount ?? 0} late`,
        icon: 'check_circle',
        tone: 'green'
      },
      {
        label: 'Absence Rate',
        value: `${summary?.absenceRate ?? 0}%`,
        hint: `${summary?.absentCount ?? 0} absences`,
        icon: 'cancel',
        tone: 'red'
      },
      {
        label: 'Late Rate',
        value: `${summary?.lateRate ?? 0}%`,
        hint: `${summary?.lateCount ?? 0} late records`,
        icon: 'schedule',
        tone: 'orange'
      },
      {
        label: 'Excused Rate',
        value: `${summary?.excusedRate ?? 0}%`,
        hint: `${summary?.excusedCount ?? 0} excused records`,
        icon: 'verified',
        tone: 'cyan'
      }
    ];
  }

  toneClass(tone: string): string {
    return `tone-${tone}`;
  }
}
