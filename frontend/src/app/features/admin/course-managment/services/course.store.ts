import { Injectable, computed, signal } from '@angular/core';
import { CourseService } from './course.service';
import { SubjectService } from '../../subject-managment/services/subject.service';
import { CourseResponse, CourseStatsResponse, AddCourseRequest } from '../models/course.model';
import { SubjectResponse } from '../../subject-managment/models/subject.model';

@Injectable({
  providedIn: 'root'
})
export class CourseStore {
  private readonly _courses = signal<CourseResponse[]>([]);
  private readonly _subjects = signal<SubjectResponse[]>([]);
  private readonly _stats = signal<CourseStatsResponse | null>(null);
  private readonly _keyword = signal('');
  private readonly _loading = signal(false);
  private readonly _selectedIds = signal<Set<number>>(new Set<number>());

  readonly courses = this._courses.asReadonly();
  readonly subjects = this._subjects.asReadonly();
  readonly stats = this._stats.asReadonly();
  readonly keyword = this._keyword.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly selectedIds = this._selectedIds.asReadonly();

  readonly selectedCount = computed(() => this._selectedIds().size);

  readonly filteredCourses = computed(() => {
    const kw = this._keyword().trim().toLowerCase();
    const list = this._courses();
    if (!kw) return list;
    return list.filter(c =>
      c.code?.toLowerCase().includes(kw) ||
      c.title?.toLowerCase().includes(kw) ||
      c.subjectName?.toLowerCase().includes(kw)
    );
  });

  readonly filteredCourseIds = computed(() => this.filteredCourses().map(c => c.id));

  constructor(
    private courseService: CourseService,
    private subjectService: SubjectService
  ) {}

  init(): void {
    this.loadAll();
    this.loadSubjects();
  }

  setKeyword(value: string): void {
    this._keyword.set(value);
  }

  loadAll(): void {
    this._loading.set(true);
    this.courseService.getCourses().subscribe({
      next: (courses) => {
        this._courses.set(courses);
        this._loading.set(false);
      },
      error: () => this._loading.set(false)
    });
    this.courseService.getStats().subscribe({
      next: (stats) => this._stats.set(stats),
      error: () => this._stats.set(null)
    });
  }

  loadSubjects(): void {
    this.subjectService.getSubjects().subscribe({
      next: (subjects) => this._subjects.set(subjects),
      error: () => this._subjects.set([])
    });
  }

  create(request: AddCourseRequest): void {
    if (!request.subjectId) return;
    this.courseService.create({ ...request, subjectId: request.subjectId }).subscribe({
      next: () => this.loadAll()
    });
  }

  update(id: number, request: AddCourseRequest): void {
    if (!request.subjectId) return;
    this.courseService.update(id, { ...request, subjectId: request.subjectId }).subscribe({
      next: () => this.loadAll()
    });
  }

  delete(id: number): void {
    this.courseService.delete(id).subscribe({
      next: () => this.loadAll()
    });
  }

  bulkDeleteSelected(): void {
    const ids = Array.from(this._selectedIds());
    if (ids.length === 0) return;
    this.courseService.bulkDelete({ courseIds: ids }).subscribe({
      next: () => {
        this.clearSelection();
        this.loadAll();
      }
    });
  }

  isSelected(id: number): boolean {
    return this._selectedIds().has(id);
  }

  toggleOne(id: number, checked: boolean): void {
    const next = new Set(this._selectedIds());
    if (checked) next.add(id);
    else next.delete(id);
    this._selectedIds.set(next);
  }

  toggleSelectAllOnList(checked: boolean, ids: number[]): void {
    if (!checked) {
      const next = new Set(this._selectedIds());
      ids.forEach(id => next.delete(id));
      this._selectedIds.set(next);
      return;
    }
    const next = new Set(this._selectedIds());
    ids.forEach(id => next.add(id));
    this._selectedIds.set(next);
  }

  clearSelection(): void {
    this._selectedIds.set(new Set<number>());
  }
}

