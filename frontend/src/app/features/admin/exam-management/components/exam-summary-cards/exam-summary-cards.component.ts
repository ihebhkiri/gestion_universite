import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';
import {ExamSummary} from '../../models/exam.model';

interface ExamSummaryCard {
  label: string;
  value: number;
  hint: string;
  icon: string;
  tone: string;
}

@Component({
  selector: 'app-exam-summary-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-summary-cards.component.html',
  styleUrl: './exam-summary-cards.component.scss'
})
export class ExamSummaryCardsComponent {
  @Input() summary: ExamSummary | null = null;

  get cards(): ExamSummaryCard[] {
    const summary = this.summary;
    return [
      {
        label: 'Total exams',
        value: summary?.totalExams ?? 0,
        hint: `${summary?.upcomingExams ?? 0} upcoming`,
        icon: 'quiz',
        tone: 'blue'
      },
      {
        label: 'Today',
        value: summary?.todayExams ?? 0,
        hint: `${summary?.usedRooms ?? 0} rooms in use`,
        icon: 'today',
        tone: 'green'
      },
      {
        label: 'In progress',
        value: summary?.inProgressExams ?? 0,
        hint: `${summary?.plannedExams ?? 0} planned`,
        icon: 'timer',
        tone: 'orange'
      },
      {
        label: 'Completed',
        value: summary?.completedExams ?? 0,
        hint: `${summary?.cancelledExams ?? 0} cancelled`,
        icon: 'task_alt',
        tone: 'slate'
      },
      {
        label: 'Conflicts',
        value: summary?.conflicts ?? 0,
        hint: 'Room, class and supervisor checks',
        icon: 'warning',
        tone: 'red'
      }
    ];
  }
}
