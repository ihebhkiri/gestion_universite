import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StudentGradeValue, StudentRecentGrade } from '../../../models/student-results.model';
import { StudentResultsService } from '../../../services/student-results.service';

@Component({
  selector: 'app-student-results-preview-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './student-results-preview-card.component.html',
  styleUrl: './student-results-preview-card.component.scss',
})
export class StudentResultsPreviewCardComponent implements OnInit {
  private readonly studentResultsService = inject(StudentResultsService);
  private readonly destroyRef = inject(DestroyRef);

  grades: StudentRecentGrade[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadGrades();
  }

  loadGrades(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.studentResultsService.getLatestGrades(5)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (grades) => {
          this.grades = grades;
          this.isLoading = false;
        },
        error: () => {
          this.grades = [];
          this.errorMessage = 'Unable to load results.';
          this.isLoading = false;
        },
      });
  }

  trackByGrade(_: number, grade: StudentRecentGrade): number {
    return grade.id;
  }

  courseName(grade: StudentRecentGrade): string {
    return grade.courseName?.trim() || 'Course not specified';
  }

  examType(grade: StudentRecentGrade): string {
    return grade.examType?.trim() || 'Evaluation';
  }

  gradeLabel(value: StudentGradeValue): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    if (typeof value === 'number') {
      return `${new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value)}/20`;
    }

    return value;
  }

  isAbsent(value: StudentGradeValue): boolean {
    return typeof value === 'string' && value.toLowerCase().includes('abs');
  }
}
