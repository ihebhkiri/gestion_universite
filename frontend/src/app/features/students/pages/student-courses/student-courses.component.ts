import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StudentHeaderComponent } from '../../../../shared/students/student-header/student-header.component';
import {
  StudentCourse,
  StudentCourseFilterOption,
  StudentCoursePeriod,
  StudentPage,
} from '../../models/student-course.model';
import { StudentCoursesService } from '../../services/student-courses.service';

const EMPTY_PAGE: StudentPage<StudentCourse> = {
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
  selector: 'app-student-courses',
  standalone: true,
  imports: [FormsModule, StudentHeaderComponent],
  templateUrl: './student-courses.component.html',
  styleUrl: './student-courses.component.scss',
})
export class StudentCoursesComponent implements OnInit {
  private readonly studentCoursesService = inject(StudentCoursesService);
  private readonly destroyRef = inject(DestroyRef);

  page: StudentPage<StudentCourse> = EMPTY_PAGE;
  isLoading = true;
  errorMessage = '';

  readonly pageSize = 10;
  period: StudentCoursePeriod = '';
  teacherId: number | null = null;
  subjectId: number | null = null;

  ngOnInit(): void {
    this.loadCourses(0);
  }

  get courses(): StudentCourse[] {
    return this.page.content;
  }

  get teacherOptions(): StudentCourseFilterOption[] {
    return this.uniqueOptions('teacherId', 'teacherName');
  }

  get subjectOptions(): StudentCourseFilterOption[] {
    return this.uniqueOptions('subjectId', 'subjectName');
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.page.totalPages }, (_, index) => index)
      .filter((pageNumber) => pageNumber === 0
        || pageNumber === this.page.totalPages - 1
        || Math.abs(pageNumber - this.page.number) <= 1);
  }

  loadCourses(page = this.page.number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.studentCoursesService.getMyCourses({
      page,
      size: this.pageSize,
      period: this.period,
      teacherId: this.teacherId,
      subjectId: this.subjectId,
      sort: 'publishedAt,desc',
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pageResponse) => {
          this.page = pageResponse;
          this.isLoading = false;
        },
        error: () => {
          this.page = { ...EMPTY_PAGE };
          this.errorMessage = 'Unable to load courses.';
          this.isLoading = false;
        },
      });
  }

  applyFilters(): void {
    this.loadCourses(0);
  }

  clearFilters(): void {
    this.period = '';
    this.teacherId = null;
    this.subjectId = null;
    this.loadCourses(0);
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.page.totalPages || page === this.page.number) {
      return;
    }

    this.loadCourses(page);
  }

  trackByCourse(_: number, course: StudentCourse): number {
    return course.id;
  }

  courseTitle(course: StudentCourse): string {
    return course.courseName?.trim() || course.courseCode?.trim() || 'Untitled course';
  }

  teacherName(course: StudentCourse): string {
    return course.teacherName?.trim() || 'Teacher not assigned';
  }

  initials(course: StudentCourse): string {
    const source = this.teacherName(course) !== 'Teacher not assigned'
      ? this.teacherName(course)
      : this.courseTitle(course);

    return source
      .split(' ')
      .map((part) => part.trim()[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'CO';
  }

  publishedLabel(course: StudentCourse): string {
    if (!course.publishedAt) {
      return 'Date not specified';
    }

    const value = new Date(course.publishedAt);
    if (Number.isNaN(value.getTime())) {
      return 'Date not specified';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(value);
  }

  private uniqueOptions(idKey: 'teacherId' | 'subjectId', labelKey: 'teacherName' | 'subjectName'): StudentCourseFilterOption[] {
    const options = new Map<number, string>();

    for (const course of this.courses) {
      const id = course[idKey];
      const label = course[labelKey];

      if (id !== null && id !== undefined && label?.trim()) {
        options.set(id, label.trim());
      }
    }

    return [...options.entries()]
      .map(([id, label]) => ({ id, label }))
      .sort((left, right) => left.label.localeCompare(right.label));
  }
}
