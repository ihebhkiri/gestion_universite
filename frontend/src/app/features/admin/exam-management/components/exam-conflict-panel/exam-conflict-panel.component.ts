import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ExamConflict} from '../../models/exam.model';

@Component({
  selector: 'app-exam-conflict-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-conflict-panel.component.html',
  styleUrl: './exam-conflict-panel.component.scss'
})
export class ExamConflictPanelComponent {
  @Input() conflicts: ExamConflict[] | null = [];
  @Input() loading = false;
  @Output() checkRequested = new EventEmitter<void>();

  icon(conflict: ExamConflict): string {
    if (conflict.conflictType === 'ROOM') return 'meeting_room';
    if (conflict.conflictType === 'SUPERVISOR') return 'co_present';
    if (conflict.conflictType === 'CLASS' || conflict.conflictType === 'GROUP') return 'groups';
    return 'warning';
  }
}
