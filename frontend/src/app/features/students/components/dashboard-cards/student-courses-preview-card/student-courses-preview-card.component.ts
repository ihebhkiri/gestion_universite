import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StudentCourse } from '../../../models/student-course.model';
import { StudentCoursesService } from '../../../services/student-courses.service';

@Component({
  selector: 'app-student-courses-preview-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './student-courses-preview-card.component.html',
  styleUrl: './student-courses-preview-card.component.scss',
})
export class StudentCoursesPreviewCardComponent implements OnInit {
  private readonly studentCoursesService = inject(StudentCoursesService);
  private readonly destroyRef = inject(DestroyRef);

  courses: StudentCourse[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.studentCoursesService.getLatestCourses(5)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (courses) => {
          this.courses = courses;
          this.isLoading = false;
        },
        error: () => {
          this.courses = [];
          this.errorMessage = 'Unable to load courses.';
          this.isLoading = false;
        },
      });
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
}
