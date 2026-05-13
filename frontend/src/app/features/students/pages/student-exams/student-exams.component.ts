import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StudentHeaderComponent } from '../../../../shared/students/student-header/student-header.component';
import { StudentExam } from '../../models/student-exam.model';
import { StudentExamsService, StudentExamTimelineState } from '../../services/student-exams.service';

@Component({
  selector: 'app-student-exams',
  standalone: true,
  imports: [StudentHeaderComponent],
  templateUrl: './student-exams.component.html',
  styleUrl: './student-exams.component.scss',
})
export class StudentExamsComponent implements OnInit {
  private readonly studentExamsService = inject(StudentExamsService);
  private readonly destroyRef = inject(DestroyRef);

  exams: StudentExam[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadExams();
  }

  loadExams(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.studentExamsService.getMyExams()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (exams) => {
          this.exams = exams;
          this.isLoading = false;
        },
        error: () => {
          this.exams = [];
          this.errorMessage = 'Unable to load exams.';
          this.isLoading = false;
        },
      });
  }

  trackByExam(_: number, exam: StudentExam): number {
    return exam.id;
  }

  timelineState(exam: StudentExam): StudentExamTimelineState {
    return this.studentExamsService.examTimelineState(exam);
  }

  courseTitle(exam: StudentExam): string {
    return exam.courseTitle?.trim() || exam.courseCode?.trim() || 'Untitled course';
  }

  examTitle(exam: StudentExam): string {
    return exam.title?.trim() || 'Exam';
  }

  dateLabel(exam: StudentExam): string {
    if (!exam.examDate) {
      return 'Unscheduled';
    }

    const value = new Date(`${exam.examDate}T00:00:00`);
    if (Number.isNaN(value.getTime())) {
      return exam.examDate;
    }

    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(value);
  }

  dayLabel(exam: StudentExam): string {
    if (!exam.examDate) {
      return '--';
    }

    const value = new Date(`${exam.examDate}T00:00:00`);
    if (Number.isNaN(value.getTime())) {
      return '--';
    }

    return new Intl.DateTimeFormat('en-US', { day: '2-digit' }).format(value);
  }

  monthLabel(exam: StudentExam): string {
    if (!exam.examDate) {
      return 'TBD';
    }

    const value = new Date(`${exam.examDate}T00:00:00`);
    if (Number.isNaN(value.getTime())) {
      return 'TBD';
    }

    return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(value);
  }

  timeRange(exam: StudentExam): string {
    if (!exam.startTime && !exam.endTime) {
      return 'Time not specified';
    }

    if (!exam.endTime) {
      return this.formatTime(exam.startTime);
    }

    return `${this.formatTime(exam.startTime)} - ${this.formatTime(exam.endTime)}`;
  }

  roomLabel(exam: StudentExam): string {
    return exam.roomName?.trim() || exam.roomCode?.trim() || 'Room not assigned';
  }

  coefficientLabel(exam: StudentExam): string {
    return exam.weight !== null && exam.weight !== undefined ? `Coeff. ${exam.weight}` : '';
  }

  statusLabel(exam: StudentExam): string {
    return exam.status ? exam.status.replace(/_/g, ' ') : 'SCHEDULED';
  }

  stateLabel(exam: StudentExam): string {
    const state = this.timelineState(exam);

    if (state === 'today') {
      return 'Today';
    }

    if (state === 'upcoming') {
      return 'Upcoming';
    }

    if (state === 'past') {
      return 'Past';
    }

    return 'Unscheduled';
  }

  private formatTime(value: string | null): string {
    if (!value) {
      return '';
    }

    const [hours = '00', minutes = '00'] = value.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }
}
