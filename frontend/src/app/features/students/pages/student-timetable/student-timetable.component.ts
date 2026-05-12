import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StudentHeaderComponent } from '../../../../shared/students/student-header/student-header.component';
import {
  StudentTimetableDay,
  StudentTimetableEntry,
  STUDENT_TIMETABLE_DAYS,
} from '../../models/student-timetable.model';
import { StudentTimetableService } from '../../services/student-timetable.service';

interface SlotCell {
  day: StudentTimetableDay;
  slot: string;
}

@Component({
  selector: 'app-student-timetable',
  standalone: true,
  imports: [RouterLink, StudentHeaderComponent],
  templateUrl: './student-timetable.component.html',
  styleUrl: './student-timetable.component.scss',
})
export class StudentTimetableComponent implements OnInit {
  private readonly studentTimetableService = inject(StudentTimetableService);

  readonly days = STUDENT_TIMETABLE_DAYS;
  readonly dayStartHour = 8;
  readonly dayEndHour = 18;
  readonly slots = Array.from({ length: (this.dayEndHour - this.dayStartHour) * 2 }, (_, index) => this.slotLabel(index));
  readonly slotCells: SlotCell[] = this.days.flatMap((day) => this.slots.map((slot) => ({ day: day.day, slot })));

  entries: StudentTimetableEntry[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadTimetable();
  }

  get hasEntries(): boolean {
    return this.entries.length > 0;
  }

  get selectedClassLabel(): string {
    return this.entries.find((entry) => entry.academicClassCode)?.academicClassCode ?? 'My class timetable';
  }

  loadTimetable(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.studentTimetableService.getWeeklyTimetable().subscribe({
      next: (entries) => {
        this.entries = entries;
        this.isLoading = false;
      },
      error: () => {
        this.entries = [];
        this.errorMessage = 'Unable to load your timetable right now.';
        this.isLoading = false;
      },
    });
  }

  trackByDay(_: number, day: { day: StudentTimetableDay; label: string }): StudentTimetableDay {
    return day.day;
  }

  trackByEntry(_: number, entry: StudentTimetableEntry): number {
    return entry.id;
  }

  trackBySlot(_: number, slot: string): string {
    return slot;
  }

  trackByCell(_: number, cell: SlotCell): string {
    return `${cell.day}-${cell.slot}`;
  }

  courseTitle(entry: StudentTimetableEntry): string {
    return entry.courseTitle?.trim() || entry.courseCode?.trim() || 'Untitled course';
  }

  detailLine(entry: StudentTimetableEntry): string {
    return [entry.teacherName, entry.roomName || entry.roomCode, entry.semesterName]
      .map((value) => value?.trim())
      .filter((value): value is string => !!value)
      .join(' - ') || 'Course details unavailable';
  }

  courseCode(entry: StudentTimetableEntry): string {
    return entry.courseCode?.trim() || 'Course';
  }

  roomLabel(entry: StudentTimetableEntry): string {
    return entry.roomCode?.trim() || entry.roomName?.trim() || 'Room TBA';
  }

  column(entry: StudentTimetableEntry): string {
    const index = this.days.findIndex((day) => day.day === entry.dayOfWeek);
    return `${Math.max(index, 0) + 2} / span 1`;
  }

  row(entry: StudentTimetableEntry): string {
    const start = this.timeValue(entry.startTime);
    const end = this.timeValue(entry.endTime);

    if (!Number.isFinite(start) || !Number.isFinite(end)) {
      return '2 / span 1';
    }

    const base = this.dayStartHour * 60;
    const startSlot = Math.max(0, Math.floor((start - base) / 30));
    const span = Math.max(1, Math.ceil((end - start) / 30));
    return `${startSlot + 2} / span ${span}`;
  }

  cellColumn(cell: SlotCell): number {
    return this.days.findIndex((day) => day.day === cell.day) + 2;
  }

  cellRow(cell: SlotCell): number {
    return this.slots.indexOf(cell.slot) + 2;
  }

  badgeClass(sessionType: string | null): string {
    const normalized = sessionType?.toUpperCase();

    if (normalized === 'TD') {
      return 'timetable-badge timetable-badge-td';
    }
    if (normalized === 'TP') {
      return 'timetable-badge timetable-badge-tp';
    }
    return 'timetable-badge timetable-badge-cm';
  }

  formatTime(value: string | null): string {
    if (!value) {
      return '--:--';
    }

    const [hours = '00', minutes = '00'] = value.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }

  durationLabel(entry: StudentTimetableEntry): string {
    const duration = this.durationMinutes(entry);
    return duration === null ? '' : `${duration} min`;
  }

  private durationMinutes(entry: StudentTimetableEntry): number | null {
    const start = this.timeValue(entry.startTime);
    const end = this.timeValue(entry.endTime);

    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      return null;
    }

    return end - start;
  }

  private slotLabel(index: number): string {
    const total = this.dayStartHour * 60 + index * 30;
    const hour = Math.floor(total / 60);
    const minute = total % 60;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  }

  private timeValue(value: string | null | undefined): number {
    if (!value) {
      return Number.POSITIVE_INFINITY;
    }

    const [hours = '0', minutes = '0'] = value.split(':');
    return Number(hours) * 60 + Number(minutes);
  }
}
