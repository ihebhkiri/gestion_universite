import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule, FormBuilder, FormGroup} from '@angular/forms';
import {Subscription} from 'rxjs';
import {SidebarComponent} from '../../../../../shared/components/admin/sidebar/sidebar.component';
import {HeaderComponent} from '../../../../../shared/components/admin/header/header.component';
import {StudentService} from '../../services/student.service';
import {
  AddStudentRequest, StudentFilterForm,
  StudentResponse,
  StudentStatsResponse,
  UpdateStudentRequest
} from '../../models/student.model';
import {Router} from '@angular/router';
import { AcademicYearService } from '../../../academic-year-managment/services/academic-year.service';
import { ProgramService } from '../../../program-managment/services/program.service';
import { AcademicYearResponse } from '../../../academic-year-managment/models/academic-year.model';
import { ProgramResponse } from '../../../program-managment/models/program.model';

import {UpdateStudentComponent} from '../../components/update-student/update-student.component';
import {AddStudentComponent} from '../../components/add-student/add-student.component';
import {EnrollmentService} from '../../services/enrollment.service';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-students-managment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    HeaderComponent,
    AddStudentComponent,
    UpdateStudentComponent,
    ReactiveFormsModule
  ],
  templateUrl: './students-managment.component.html',
  styleUrl: './students-managment.component.scss',
})
export class StudentsManagmentComponent implements OnInit {
  Math = Math;
  students: StudentResponse[] = [];
  stats: StudentStatsResponse | null = null;

  academicYears: AcademicYearResponse[] = [];
  programs: ProgramResponse[] = [];

  isLoading = false;
  hasError = false;

  // Pagination & Sorting
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  pagesArray: number[] = [];
  sortField = 'id';
  sortDirection = 'desc';

  // Filters
  filterForm: FormGroup<StudentFilterForm>;
  private formSub!: Subscription;

  // Modals state
  isAddModalVisible = false;
  isUpdateModalVisible = false;
  selectedStudent: StudentResponse | null = null;

  // Bulk selection
  selectedIds = new Set<number>();
  bulkStatus: string = '';

  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private enrollmentService: EnrollmentService,
    private academicYearService: AcademicYearService,
    private programService: ProgramService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.filterForm = this.fb.group({
      search: this.fb.nonNullable.control(''),
      academicYear: this.fb.nonNullable.control(''),
      program: this.fb.nonNullable.control(''),
      status: this.fb.nonNullable.control('')
    });
  }

  ngOnInit(): void {
    this.loadStats();
    this.loadStudents();
    this.loadFilterOptions();

    this.formSub = this.studentService
      .processFilterChanges(this.filterForm.valueChanges)
      .subscribe(() => {
        this.currentPage = 0;
        this.loadStudents();
      });
  }



  loadFilterOptions(): void {
    this.academicYearService.getAll().subscribe({
      next: (res) => this.academicYears = res,
      error: (err) => console.error('Failed to load academic years', err)
    });
    this.programService.getPrograms().subscribe({
      next: (res) => this.programs = res,
      error: (err) => console.error('Failed to load programs', err)
    });
  }

  loadStats(): void {
    this.studentService.getStudentStats().subscribe({
      next: (res) => this.stats = res,
      error: (err) => this.toastr.error('Failed to load stats', err)
    });
  }

  loadStudents(): void {
    this.isLoading = true;
    this.hasError = false;

    const filters = this.filterForm.value;
    const sortParams = `${this.sortField},${this.sortDirection}`;

    this.studentService.getStudents(this.currentPage, this.pageSize, filters, sortParams).subscribe({
      next: (res) => {
        this.students = res.content;
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;
        this.pagesArray = Array.from({length: this.totalPages}, (_, i) => i);
        this.isLoading = false;
      },
      error: (err) => {
        this.toastr.error('Failed to load students', err);
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadStudents();
    }
  }

  changePageSize(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.pageSize = Number(select.value);
    this.currentPage = 0;
    this.loadStudents();
  }

  changeSort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.currentPage = 0;
    this.loadStudents();
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
      error: (err) => this.toastr.error('Failed to save student', err)
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
      error: (err) => this.toastr.error('Failed to update student', err)
    });
  }

  // Bulk selection helpers
  get selectedCount(): number {
    return this.selectedIds.size;
  }

  isSelected(id: number): boolean {
    return this.selectedIds.has(id);
  }

  toggleSelectAllOnPage(event : Event): void {
    const input = event.target as HTMLInputElement;
    const checked = input.checked;
    if (checked) {
      this.students.forEach(s => this.selectedIds.add(s.id));
    } else {
      this.students.forEach(s => this.selectedIds.delete(s.id));
    }
  }

  toggleOne(id: number, event : Event): void {
    const input = event.target as HTMLInputElement;
    const checked = input.checked;
    if (checked) this.selectedIds.add(id);
    else this.selectedIds.delete(id);
  }

  clearSelection(): void {
    this.selectedIds.clear();
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
      error: (err) => this.toastr.error('Failed to bulk delete students', err)
    });
  }

  bulkChangeStatus(): void {
    if (this.selectedIds.size === 0) return;
    if (!this.bulkStatus) {
      this.toastr.warning('Please select a status first');
      return;
    }
    this.isLoading = true;
    this.enrollmentService.bulkChangeEnrollmentStatus(Array.from(this.selectedIds), this.bulkStatus).subscribe({
      next: () => {
        this.toastr.success('Enrollment status updated successfully');
        this.clearSelection();
        this.bulkStatus = '';
        this.loadStudents();
        this.loadStats();
      },
      error: (err) => {
        this.isLoading = false;
        this.toastr.error('Failed to bulk change enrollment status', err);
      }
    });
  }

  goToEnrollment(studentId?: number): void {
    const returnUrl = '/admins/students';
    const extras = studentId ? `?studentId=${studentId}&returnUrl=${encodeURIComponent(returnUrl)}` : `?returnUrl=${encodeURIComponent(returnUrl)}`;
    this.router.navigateByUrl(`/admins/enrollments${extras}`);
  }
  // status
  statusConfig: Record<string, any> = {
    CONFIRMED: {
      label: 'CONFIRMED',
      class: 'bg-[#ecfdf5] text-[#065f46]'
    },
    CANCELLED: {
      label: 'CANCELLED',
      class: 'bg-error-container text-on-error-container'
    },
    COMPLETED: {
      label: 'COMPLETED',
      class: 'bg-blue-100 text-blue-800'
    },
    DEFAULT: {
      label: 'PENDING',
      class: 'bg-tertiary-fixed text-on-primary-fixed-variant'
    }
  };
  getStatusConfig(status: string) {
    return this.statusConfig[status] || this.statusConfig['DEFAULT'];
  }
}
