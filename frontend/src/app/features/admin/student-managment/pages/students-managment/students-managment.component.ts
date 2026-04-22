import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../../../shared/components/admin/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../../shared/components/admin/header/header.component';
import { StudentService } from '../../services/student.service';
import { StudentResponse, StudentStatsResponse, AddStudentRequest, UpdateStudentRequest } from '../../models/student.model';
import { Router } from '@angular/router';

import { UpdateStudentComponent } from '../../components/update-student/update-student.component';
import {AddStudentComponent} from '../../components/add-student/add-student.component';
import { EnrollmentService } from '../../services/enrollment.service';

@Component({
  selector: 'app-students-managment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    HeaderComponent,
    AddStudentComponent,
    UpdateStudentComponent
  ],
  templateUrl: './students-managment.component.html',
  styleUrl: './students-managment.component.scss',
})
export class StudentsManagmentComponent implements OnInit {
  Math = Math;
  students: StudentResponse[] = [];
  stats: StudentStatsResponse | null = null;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  pagesArray: number[] = [];

  // Search
  keyword: string = '';
  private searchTimer: any = null;

  // Modals state
  isAddModalVisible = false;
  isUpdateModalVisible = false;
  selectedStudent: StudentResponse | null = null;

  // Bulk selection
  selectedIds = new Set<number>();
  bulkStatus: string = 'ACTIVE';

  constructor(
    private studentService: StudentService,
    private enrollmentService: EnrollmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadStudents();
  }

  loadStats(): void {
    this.studentService.getStudentStats().subscribe({
      next: (res) => this.stats = res,
      error: (err) => console.error('Failed to load stats', err)
    });
  }

  loadStudents(): void {
    this.studentService.getStudents(this.keyword, this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.students = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.pagesArray = Array.from({length: this.totalPages}, (_, i) => i);
        this.syncSelectionWithPage();
      },
      error: (err) => console.error('Failed to load students', err)
    });
  }

  onSearch(event: any): void {
    const value = event.target.value;
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
    }
    this.searchTimer = setTimeout(() => {
      this.keyword = value;
      this.currentPage = 0;
      this.loadStudents();
    }, 400);
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadStudents();
    }
  }

  // Helper method for generating profile image URL
  getImageUrl(filename?: string): string {
    if (filename) {
      return `http://localhost:8888/api/v1/admin/students/images/${filename}`;
    }
    return 'https://ui-avatars.com/api/?name=Student&background=random';
  }

  showAddModal(): void {
    this.isAddModalVisible = true;
  }

  hideAddModal(): void {
    this.isAddModalVisible = false;
  }

  onSaveStudent(event: { student: AddStudentRequest, image: File | undefined }): void {
    this.studentService.addStudent(event.student, event.image).subscribe({
      next: () => {
        this.hideAddModal();
        this.loadStudents();
        this.loadStats();
      },
      error: (err) => console.error('Failed to save student', err)
    });
  }

  showUpdateModal(student: StudentResponse): void {
    this.selectedStudent = student;
    this.isUpdateModalVisible = true;
  }

  hideUpdateModal(): void {
    this.isUpdateModalVisible = false;
    this.selectedStudent = null;
  }

  onUpdateStudent(event: { id: number, updateData: UpdateStudentRequest }): void {
    this.studentService.updateStudent(event.id, event.updateData).subscribe({
      next: () => {
        this.hideUpdateModal();
        this.loadStudents();
      },
      error: (err) => console.error('Failed to update student', err)
    });
  }

  // Bulk selection helpers
  get selectedCount(): number {
    return this.selectedIds.size;
  }

  isSelected(id: number): boolean {
    return this.selectedIds.has(id);
  }

  toggleSelectAllOnPage(checked: boolean): void {
    if (checked) {
      this.students.forEach(s => this.selectedIds.add(s.id));
    } else {
      this.students.forEach(s => this.selectedIds.delete(s.id));
    }
  }

  toggleOne(id: number, checked: boolean): void {
    if (checked) this.selectedIds.add(id);
    else this.selectedIds.delete(id);
  }

  clearSelection(): void {
    this.selectedIds.clear();
  }

  private syncSelectionWithPage(): void {
    // keep selections across pages; no-op needed for now
  }

  bulkDelete(): void {
    if (this.selectedIds.size === 0) return;
    if (!confirm(`Delete ${this.selectedIds.size} student(s)?`)) return;
    this.studentService.bulkDelete({ studentIds: Array.from(this.selectedIds) }).subscribe({
      next: () => {
        this.clearSelection();
        this.loadStudents();
        this.loadStats();
      },
      error: (err) => console.error('Failed to bulk delete students', err)
    });
  }

  bulkChangeStatus(): void {
    if (this.selectedIds.size === 0) return;
    this.enrollmentService.bulkChangeEnrollmentStatus(Array.from(this.selectedIds), this.bulkStatus).subscribe({
      next: () => {
        this.clearSelection();
        this.loadStudents();
        this.loadStats();
      },
      error: (err) => console.error('Failed to bulk change enrollment status', err)
    });
  }

  goToEnrollment(studentId?: number): void {
    const returnUrl = '/admins/students';
    const extras = studentId ? `?studentId=${studentId}&returnUrl=${encodeURIComponent(returnUrl)}` : `?returnUrl=${encodeURIComponent(returnUrl)}`;
    this.router.navigateByUrl(`/admins/enrollments${extras}`);
  }
}
