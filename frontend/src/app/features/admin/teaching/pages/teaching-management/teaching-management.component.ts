import {Component, OnInit, inject} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {forkJoin} from 'rxjs';
import {SidebarComponent} from '../../../../../shared/components/admin/sidebar/sidebar.component';
import {HeaderComponent} from '../../../../../shared/components/admin/header/header.component';
import {SubjectsPanelComponent} from '../../components/subjects-panel/subjects-panel.component';
import {TeachersTableComponent} from '../../components/teachers-table/teachers-table.component';
import {TeacherFormModalComponent} from '../../components/teacher-form-modal/teacher-form-modal.component';
import {
  AddTeacherRequest,
  Department,
  Teacher,
  UpdateTeacherRequest,
  Subject
} from '../../models/teaching.model';
import {TeachingService} from '../../services/teaching.service';

@Component({
  selector: 'app-teaching-management',
  imports: [
    SidebarComponent,
    HeaderComponent,
    SubjectsPanelComponent,
    TeachersTableComponent,
    TeacherFormModalComponent,
  ],
  templateUrl: './teaching-management.component.html',
  styleUrl: './teaching-management.component.scss',
})
export class TeachingManagementComponent implements OnInit {
  private readonly teachingService = inject(TeachingService);
  private readonly toastr = inject(ToastrService);

  protected teachers: Teacher[] = [];
  protected subjects: Subject[] = [];
  protected departments: Department[] = [];

  protected modalOpen = false;
  protected teacherToEdit: Teacher | null = null;

  ngOnInit(): void {
    this.loadInitialData();
  }

  private loadInitialData() {
    forkJoin({
      teachers: this.teachingService.getTeachers(),
      subjects: this.teachingService.getSubjects(),
      departments: this.teachingService.getDepartments(),
    }).subscribe({
      next: ({teachers, subjects, departments}) => {
        this.teachers = teachers;
        this.subjects = subjects;
        this.departments = departments;
      },
      error: () => this.toastr.error('Failed to load teaching module data.'),
    });
  }

  protected openCreateTeacherModal() {
    this.teacherToEdit = null;
    this.modalOpen = true;
  }

  protected openEditTeacherModal(teacher: Teacher) {
    this.teacherToEdit = teacher;
    this.modalOpen = true;
  }

  protected closeModal() {
    this.modalOpen = false;
    this.teacherToEdit = null;
  }

  protected onCreateTeacher(request: AddTeacherRequest) {
    this.teachingService.createTeacher(request).subscribe({
      next: () => {
        this.toastr.success('Teacher created successfully.');
        this.closeModal();
        this.reloadTeachers();
      },
      error: (err) => this.toastr.error(err?.error?.message ?? 'Failed to create teacher.'),
    });
  }

  protected onUpdateTeacher(event: { id: number; request: UpdateTeacherRequest }) {
    this.teachingService.updateTeacher(event.id, event.request).subscribe({
      next: () => {
        this.toastr.success('Teacher updated successfully.');
        this.closeModal();
        this.reloadTeachers();
      },
      error: (err) => this.toastr.error(err?.error?.message ?? 'Failed to update teacher.'),
    });
  }

  protected onDeleteTeacher(id: number) {
    if (!confirm('Delete this teacher?')) {
      return;
    }

    this.teachingService.deleteTeacher(id).subscribe({
      next: () => {
        this.toastr.success('Teacher deleted successfully.');
        this.reloadTeachers();
      },
      error: () => this.toastr.error('Failed to delete teacher.'),
    });
  }

  protected onAddSubject(subjectName: string) {
    this.teachingService.createSubject({subjectName}).subscribe({
      next: () => {
        this.toastr.success('Subject added successfully.');
        this.reloadSubjects();
      },
      error: (err) => this.toastr.error(err?.error?.message ?? 'Failed to add subject.'),
    });
  }

  protected onUpdateSubject(event: { id: number; subjectName: string }) {
    this.teachingService.updateSubject(event.id, {subjectName: event.subjectName}).subscribe({
      next: () => {
        this.toastr.success('Subject updated successfully.');
        this.reloadSubjects();
      },
      error: () => this.toastr.error('Failed to update subject.'),
    });
  }

  protected onDeleteSubject(id: number) {
    if (!confirm('Delete this subject?')) {
      return;
    }

    this.teachingService.deleteSubject(id).subscribe({
      next: () => {
        this.toastr.success('Subject deleted successfully.');
        this.reloadSubjects();
      },
      error: () => this.toastr.error('Failed to delete subject.'),
    });
  }

  private reloadTeachers() {
    this.teachingService.getTeachers().subscribe({
      next: (teachers) => this.teachers = teachers,
      error: () => this.toastr.error('Failed to refresh teachers.'),
    });
  }

  private reloadSubjects() {
    this.teachingService.getSubjects().subscribe({
      next: (subjects) => this.subjects = subjects,
      error: () => this.toastr.error('Failed to refresh subjects.'),
    });
  }
}
