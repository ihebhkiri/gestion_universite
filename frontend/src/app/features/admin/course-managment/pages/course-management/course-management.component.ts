import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../../../shared/components/admin/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../../shared/components/admin/header/header.component';
import { CourseStore } from '../../services/course.store';
import { AddCourseRequest, CourseResponse } from '../../models/course.model';
import { AddCourseComponent } from '../../components/add-course/add-course.component';
import { UpdateCourseComponent } from '../../components/update-course/update-course.component';

@Component({
  selector: 'app-course-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    HeaderComponent,
    AddCourseComponent,
    UpdateCourseComponent
  ],
  templateUrl: './course-management.component.html',
  styleUrl: './course-management.component.scss'
})
export class CourseManagementComponent implements OnInit {
  isAddModalVisible = false;
  isUpdateModalVisible = false;
  selectedCourse: CourseResponse | null = null;

  constructor(public readonly store: CourseStore) {}

  ngOnInit(): void {
    this.store.init();
  }

  onSearch(event: Event): void {
    this.store.setKeyword((event.target as HTMLInputElement).value);
  }

  showAddModal(): void {
    this.isAddModalVisible = true;
  }

  hideAddModal(): void {
    this.isAddModalVisible = false;
  }

  showUpdateModal(course: CourseResponse): void {
    this.selectedCourse = course;
    this.isUpdateModalVisible = true;
  }

  hideUpdateModal(): void {
    this.isUpdateModalVisible = false;
    this.selectedCourse = null;
  }

  onCreate(request: AddCourseRequest): void {
    this.store.create(request);
    this.hideAddModal();
  }

  onUpdate(event: { id: number; request: AddCourseRequest }): void {
    this.store.update(event.id, event.request);
    this.hideUpdateModal();
  }

  onDelete(id: number): void {
    if (!confirm('Delete this course?')) return;
    this.store.delete(id);
  }

  bulkDelete(): void {
    const count = this.store.selectedCount();
    if (count === 0) return;
    if (!confirm(`Delete ${count} course(s)?`)) return;
    this.store.bulkDeleteSelected();
  }
}

