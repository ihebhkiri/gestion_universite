import {animate, query, stagger, style, transition, trigger} from '@angular/animations';
import {CommonModule} from '@angular/common';
import {Component, inject} from '@angular/core';
import {TimetableDay, TimetableEntryResponse} from '../../models/timetable.model';
import {TimetableFacadeService} from '../../services/timetable-facade.service';

interface SlotCell {
  day: TimetableDay;
  slot: string;
}

@Component({
  selector: 'app-timetable-grid',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('entryList', [
      transition('* => *', [
        query('.course-card:enter', [
          style({opacity: 0, transform: 'translateY(10px) scale(0.98)'}),
          stagger(35, animate('180ms ease-out', style({opacity: 1, transform: 'translateY(0) scale(1)'})))
        ], {optional: true})
      ])
    ])
  ],
  templateUrl: './timetable-grid.component.html',
  styleUrl: './timetable-grid.component.scss'
})
export class TimetableGridComponent {
  readonly facade = inject(TimetableFacadeService);
  readonly dayStartHour = 8;
  readonly dayEndHour = 18;
  readonly slots = Array.from({length: (this.dayEndHour - this.dayStartHour) * 2}, (_, index) => this.slotLabel(index));
  readonly slotCells: SlotCell[] = this.facade.days.flatMap(day => this.slots.map(slot => ({day: day.value, slot})));

  column(entry: TimetableEntryResponse): string {
    const index = this.facade.days.findIndex(day => day.value === entry.dayOfWeek);
    return `${index + 2} / span 1`;
  }

  row(entry: TimetableEntryResponse): string {
    const start = this.minutes(entry.startTime);
    const end = this.minutes(entry.endTime);
    const base = this.dayStartHour * 60;
    const startSlot = Math.max(0, Math.floor((start - base) / 30));
    const span = Math.max(1, Math.ceil((end - start) / 30));
    return `${startSlot + 2} / span ${span}`;
  }

  cellColumn(cell: SlotCell): number {
    return this.facade.days.findIndex(day => day.value === cell.day) + 2;
  }

  cellRow(cell: SlotCell): number {
    return this.slots.indexOf(cell.slot) + 2;
  }

  openFromCell(cell: SlotCell): void {
    this.facade.openCreate(cell.day, cell.slot);
  }

  private slotLabel(index: number): string {
    const total = this.dayStartHour * 60 + index * 30;
    const hour = Math.floor(total / 60);
    const minute = total % 60;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }

  private minutes(value: string): number {
    const [hour, minute] = value.slice(0, 5).split(':').map(Number);
    return hour * 60 + minute;
  }
}
