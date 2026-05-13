import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StudentHeaderComponent } from '../../../../shared/students/student-header/student-header.component';
import {
  StudentAcademicResult,
  StudentGradeSubject,
  StudentGradeUnit,
  StudentGradeValue,
  StudentResultsResponse,
} from '../../models/student-results.model';
import { StudentResultsService } from '../../services/student-results.service';

@Component({
  selector: 'app-student-results',
  standalone: true,
  imports: [StudentHeaderComponent],
  templateUrl: './student-results.component.html',
  styleUrl: './student-results.component.scss',
})
export class StudentResultsComponent implements OnInit {
  private readonly studentResultsService = inject(StudentResultsService);
  private readonly destroyRef = inject(DestroyRef);

  data: StudentResultsResponse | null = null;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadResults();
  }

  get results(): StudentAcademicResult[] {
    return this.data?.results ?? [];
  }

  get gradeUnits(): StudentGradeUnit[] {
    return this.data?.gradeUnits ?? [];
  }

  get hasData(): boolean {
    return this.results.length > 0 || this.gradeUnits.length > 0;
  }

  get profileMeta(): string {
    const className = this.data?.student?.className;
    const academicYear = this.data?.student?.academicYear;
    return [className, academicYear].filter(Boolean).join(' - ');
  }

  loadResults(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.studentResultsService.getMyResults()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.data = response;
          this.isLoading = false;
        },
        error: () => {
          this.data = null;
          this.errorMessage = 'Impossible de charger les résultats.';
          this.isLoading = false;
        },
      });
  }

  trackResult(index: number, result: StudentAcademicResult): string {
    return `${result.type}-${result.period ?? index}`;
  }

  trackUnit(index: number, unit: StudentGradeUnit): string {
    return `${unit.unitName}-${unit.semester ?? index}`;
  }

  trackSubject(index: number, subject: StudentGradeSubject): string {
    return `${subject.subjectName}-${index}`;
  }

  formatNumber(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return '-';
    }

    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  displayValue(value: StudentGradeValue): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    if (typeof value === 'number') {
      return this.formatNumber(value);
    }

    return value;
  }

  isAbsent(value: StudentGradeValue): boolean {
    return typeof value === 'string' && value.toLowerCase().includes('abs');
  }

  displayText(value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    return `${value}`;
  }
}
