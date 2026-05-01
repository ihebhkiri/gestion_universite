import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {ExamResponse} from '../../models/exam.model';

interface ExamCalendarCell {
  date: string;
  day: number;
  inCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  count: number;
  hasConflictRisk: boolean;
}

@Component({
  selector: 'app-exam-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './exam-calendar.component.html',
  styleUrl: './exam-calendar.component.scss'
})
export class ExamCalendarComponent implements OnChanges {
  @Input() exams: ExamResponse[] | null = [];
  @Input() selectedDate: string | null = null;
  @Output() dateSelected = new EventEmitter<string | null>();

  readonly weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  monthCursor = new Date();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedDate'] && this.selectedDate) {
      const selected = this.parseDate(this.selectedDate);
      this.monthCursor = new Date(selected.getFullYear(), selected.getMonth(), 1);
    }
  }

  get monthLabel(): string {
    return new Intl.DateTimeFormat('en', {month: 'long', year: 'numeric'}).format(this.monthCursor);
  }

  get cells(): ExamCalendarCell[] {
    const firstDay = new Date(this.monthCursor.getFullYear(), this.monthCursor.getMonth(), 1);
    const mondayOffset = (firstDay.getDay() + 6) % 7;
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() - mondayOffset);

    return Array.from({length: 42}, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const key = this.toDateKey(date);
      const dayExams = (this.exams ?? []).filter(exam => exam.examDate === key);

      return {
        date: key,
        day: date.getDate(),
        inCurrentMonth: date.getMonth() === this.monthCursor.getMonth(),
        isToday: key === this.toDateKey(new Date()),
        isSelected: key === this.selectedDate,
        count: dayExams.length,
        hasConflictRisk: this.hasSameRoomOverlap(dayExams)
      };
    });
  }

  previousMonth(): void {
    this.monthCursor = new Date(this.monthCursor.getFullYear(), this.monthCursor.getMonth() - 1, 1);
  }

  nextMonth(): void {
    this.monthCursor = new Date(this.monthCursor.getFullYear(), this.monthCursor.getMonth() + 1, 1);
  }

  today(): void {
    const today = new Date();
    this.monthCursor = new Date(today.getFullYear(), today.getMonth(), 1);
    this.dateSelected.emit(this.toDateKey(today));
  }

  selectDate(date: string): void {
    this.dateSelected.emit(this.selectedDate === date ? null : date);
  }

  private hasSameRoomOverlap(exams: ExamResponse[]): boolean {
    const roomSlots = new Set<string>();
    return exams.some(exam => {
      if (!exam.roomId || !exam.startTime || !exam.endTime) return false;
      const key = `${exam.roomId}-${exam.startTime}-${exam.endTime}`;
      if (roomSlots.has(key)) return true;
      roomSlots.add(key);
      return false;
    });
  }

  private parseDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
