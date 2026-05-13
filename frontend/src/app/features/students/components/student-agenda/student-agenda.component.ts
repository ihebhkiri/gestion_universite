import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StudentTimetableEntry } from '../../models/student-timetable.model';
import { StudentTimetableService } from '../../services/student-timetable.service';

@Component({
  selector: 'app-student-agenda',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './student-agenda.component.html',
  styleUrl: './student-agenda.component.scss',
})
export class StudentAgendaComponent implements OnInit {
  private readonly studentTimetableService = inject(StudentTimetableService);

  items: StudentTimetableEntry[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadAgenda();
  }

  get dateLabel(): string {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }).format(new Date());
  }

  loadAgenda(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.studentTimetableService.getTodayAgenda().subscribe({
      next: (items) => {
        this.items = items;
        this.isLoading = false;
      },
      error: () => {
        this.items = [];
        this.errorMessage = 'Unable to load today courses.';
        this.isLoading = false;
      },
    });
  }

  trackByAgendaItem(_: number, item: StudentTimetableEntry): number {
    return item.id;
  }

  courseTitle(item: StudentTimetableEntry): string {
    return item.courseTitle?.trim() || item.courseCode?.trim() || 'Untitled course';
  }

  durationLabel(item: StudentTimetableEntry): string {
    const duration = this.durationMinutes(item);

    if (duration !== null) {
      return `${duration} MIN`;
    }

    return item.endTime ? `Until ${this.formatTime(item.endTime)}` : '';
  }

  itemMeta(item: StudentTimetableEntry): string {
    return [item.teacherName, item.roomName || item.roomCode, item.sessionType]
      .map((value) => value?.trim())
      .filter((value): value is string => !!value)
      .join(' - ') || 'Course details unavailable';
  }

  formatTime(value: string | null): string {
    if (!value) {
      return '--:--';
    }

    const [hours = '00', minutes = '00'] = value.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }

  itemState(item: StudentTimetableEntry): 'past' | 'current' | 'upcoming' {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = this.timeValue(item.startTime);
    const endMinutes = this.timeValue(item.endTime);

    if (Number.isFinite(startMinutes) && Number.isFinite(endMinutes) && currentMinutes >= startMinutes && currentMinutes < endMinutes) {
      return 'current';
    }

    if (Number.isFinite(endMinutes) && currentMinutes >= endMinutes) {
      return 'past';
    }

    return 'upcoming';
  }

  private timeValue(value: string | null | undefined): number {
    if (!value) {
      return Number.POSITIVE_INFINITY;
    }

    const [hours = '0', minutes = '0'] = value.split(':');
    return Number(hours) * 60 + Number(minutes);
  }

  private durationMinutes(item: StudentTimetableEntry): number | null {
    const start = this.timeValue(item.startTime);
    const end = this.timeValue(item.endTime);

    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
      return null;
    }

    return end - start;
  }
}
