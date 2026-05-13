import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StudentHeaderComponent } from '../../../../shared/students/student-header/student-header.component';
import { StudentPage } from '../../models/student-course.model';
import {
  StudentAttendance,
  StudentAttendanceFilterOption,
  StudentAttendanceSummary,
} from '../../models/student-attendance.model';
import { StudentAttendanceService } from '../../services/student-attendance.service';

const EMPTY_PAGE: StudentPage<StudentAttendance> = {
  content: [],
  totalPages: 0,
  totalElements: 0,
  size: 10,
  number: 0,
  first: true,
  last: true,
  numberOfElements: 0,
  empty: true,
};

@Component({
  selector: 'app-student-attendance',
  standalone: true,
  imports: [FormsModule, StudentHeaderComponent],
  templateUrl: './student-attendance.component.html',
  styleUrl: './student-attendance.component.scss',
})
export class StudentAttendanceComponent implements OnInit {
  private readonly attendanceService = inject(StudentAttendanceService);
  private readonly destroyRef = inject(DestroyRef);

  page: StudentPage<StudentAttendance> = EMPTY_PAGE;
  summary: StudentAttendanceSummary | null = null;
  isLoading = true;
  isSummaryLoading = true;
  errorMessage = '';

  readonly pageSize = 10;
  readonly excludedStatus = 'PRESENT';
  status = '';
  period = '';
  subjectId: number | null = null;
  teacherId: number | null = null;
  fromDate = '';
  toDate = '';

  ngOnInit(): void {
    this.loadSummary();
    this.loadAttendance(0);
  }

  get records(): StudentAttendance[] {
    return this.page.content;
  }

  get subjectOptions(): StudentAttendanceFilterOption[] {
    return this.uniqueOptions('subjectId', 'subjectName');
  }

  get teacherOptions(): StudentAttendanceFilterOption[] {
    return this.uniqueOptions('teacherId', 'teacherName');
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.page.totalPages }, (_, index) => index)
      .filter((pageNumber) => pageNumber === 0
        || pageNumber === this.page.totalPages - 1
        || Math.abs(pageNumber - this.page.number) <= 1);
  }

  loadSummary(): void {
    this.isSummaryLoading = true;

    this.attendanceService.getMyAttendanceSummary()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (summary) => {
          this.summary = summary;
          this.isSummaryLoading = false;
        },
        error: () => {
          this.summary = null;
          this.isSummaryLoading = false;
        },
      });
  }

  loadAttendance(page = this.page.number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.attendanceService.getMyAttendance({
      page,
      size: this.pageSize,
      status: this.status,
      excludeStatus: this.excludedStatus,
      period: this.period,
      subjectId: this.subjectId,
      teacherId: this.teacherId,
      fromDate: this.fromDate,
      toDate: this.toDate,
      sort: 'sessionDate,desc',
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pageResponse) => {
          this.page = pageResponse;
          this.isLoading = false;
        },
        error: () => {
          this.page = { ...EMPTY_PAGE };
          this.errorMessage = 'Impossible de charger les présences.';
          this.isLoading = false;
        },
      });
  }

  applyFilters(): void {
    this.loadAttendance(0);
  }

  clearFilters(): void {
    this.status = '';
    this.period = '';
    this.subjectId = null;
    this.teacherId = null;
    this.fromDate = '';
    this.toDate = '';
    this.loadAttendance(0);
  }

  retry(): void {
    this.loadSummary();
    this.loadAttendance();
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.page.totalPages || page === this.page.number) {
      return;
    }

    this.loadAttendance(page);
  }

  trackByRecord(_: number, record: StudentAttendance): number {
    return record.id;
  }

  dateLabel(value: string | null | undefined): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  timeRange(record: StudentAttendance): string {
    const start = record.startTime?.slice(0, 5);
    const end = record.endTime?.slice(0, 5);
    if (start && end) return `${start} - ${end}`;
    return start || end || '-';
  }

  displayText(value: string | null | undefined): string {
    return value?.trim() || '-';
  }

  courseName(record: StudentAttendance): string {
    return record.courseName?.trim() || record.courseCode?.trim() || 'Course not specified';
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      PRESENT: 'Present',
      ABSENT: 'Absent',
      LATE: 'Late',
      EXCUSED: 'Justified',
      JUSTIFIED: 'Justified',
    };
    return labels[status] ?? status;
  }

  statusClass(status: string): string {
    const normalized = status?.toUpperCase();
    if (normalized === 'PRESENT') return 'status-badge--present';
    if (normalized === 'ABSENT') return 'status-badge--absent';
    if (normalized === 'LATE') return 'status-badge--late';
    return 'status-badge--justified';
  }

  attendanceRate(): string {
    const rate = this.summary?.attendanceRate;
    if (rate === null || rate === undefined) return '-';
    return `${new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(rate)}%`;
  }

  private uniqueOptions(idKey: 'subjectId' | 'teacherId', labelKey: 'subjectName' | 'teacherName'): StudentAttendanceFilterOption[] {
    const options = new Map<number, string>();

    this.records.forEach((record) => {
      const id = record[idKey];
      const label = record[labelKey];
      if (id && label?.trim()) {
        options.set(id, label);
      }
    });

    return Array.from(options.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((left, right) => left.label.localeCompare(right.label));
  }
}
