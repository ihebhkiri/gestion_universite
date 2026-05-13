import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StudentExam } from '../../models/student-exam.model';
import { StudentExamsService } from '../../services/student-exams.service';

@Component({
  selector: 'app-student-side-panel',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './student-side-panel.component.html',
  styleUrl: './student-side-panel.component.scss',
})
export class StudentSidePanelComponent implements OnInit {
  private readonly studentExamsService = inject(StudentExamsService);
  private readonly destroyRef = inject(DestroyRef);

  exams: StudentExam[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadUpcomingExams();
  }

  loadUpcomingExams(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.studentExamsService.getUpcomingExamsPreview(4)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (exams) => {
          this.exams = exams;
          this.isLoading = false;
        },
        error: () => {
          this.exams = [];
          this.errorMessage = 'Unable to load upcoming exams.';
          this.isLoading = false;
        },
      });
  }

  trackByExam(_: number, exam: StudentExam): number {
    return exam.id;
  }

  monthLabel(exam: StudentExam): string {
    return this.formatDatePart(exam.examDate, { month: 'short' });
  }

  dayLabel(exam: StudentExam): string {
    return this.formatDatePart(exam.examDate, { day: '2-digit' });
  }

  examTitle(exam: StudentExam): string {
    return exam.courseTitle?.trim() || exam.courseCode?.trim() || exam.title?.trim() || 'Untitled exam';
  }

  examSubtitle(exam: StudentExam): string {
    return [exam.title, exam.type, exam.sessionType]
      .map((value) => value?.trim())
      .filter((value): value is string => !!value)
      .join(' - ');
  }

  examMeta(exam: StudentExam): string {
    return [
      this.timeRange(exam),
      exam.roomName || exam.roomCode,
    ]
      .map((value) => value?.trim())
      .filter((value): value is string => !!value)
      .join(' - ') || 'Schedule details unavailable';
  }

  private timeRange(exam: StudentExam): string {
    if (!exam.startTime && !exam.endTime) {
      return '';
    }

    if (!exam.endTime) {
      return this.formatTime(exam.startTime);
    }

    return `${this.formatTime(exam.startTime)} - ${this.formatTime(exam.endTime)}`;
  }

  private formatTime(value: string | null): string {
    if (!value) {
      return '';
    }

    const [hours = '00', minutes = '00'] = value.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }

  private formatDatePart(date: string | null, options: Intl.DateTimeFormatOptions): string {
    if (!date) {
      return '--';
    }

    const value = new Date(`${date}T00:00:00`);
    if (Number.isNaN(value.getTime())) {
      return '--';
    }

    return new Intl.DateTimeFormat('en-US', options).format(value);
  }

}
