import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StudentTopAbsence } from '../../../models/student-attendance.model';
import { StudentAttendanceService } from '../../../services/student-attendance.service';

@Component({
  selector: 'app-student-attendance-preview-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './student-attendance-preview-card.component.html',
  styleUrl: './student-attendance-preview-card.component.scss',
})
export class StudentAttendancePreviewCardComponent implements OnInit {
  private readonly attendanceService = inject(StudentAttendanceService);
  private readonly destroyRef = inject(DestroyRef);

  absences: StudentTopAbsence[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadAbsences();
  }

  loadAbsences(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.attendanceService.getTopAbsences(5)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (absences) => {
          this.absences = absences;
          this.isLoading = false;
        },
        error: () => {
          this.absences = [];
          this.errorMessage = 'Unable to load absences.';
          this.isLoading = false;
        },
      });
  }

  trackByAbsence(_: number, absence: StudentTopAbsence): string {
    return `${absence.subjectId ?? absence.subjectName}-${absence.absenceCount}`;
  }

  subjectName(absence: StudentTopAbsence): string {
    return absence.subjectName?.trim() || 'Course not specified';
  }

  absenceLabel(count: number): string {
    return `${count} absence${count === 1 ? '' : 's'}`;
  }
}
