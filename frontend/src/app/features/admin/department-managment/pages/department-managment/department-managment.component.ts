import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../../../shared/components/admin/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../../shared/components/admin/header/header.component';
import { DepartmentService } from '../../services/department.service';
import { DepartmentResponse, DepartmentStatsResponse, AddDepartmentRequest } from '../../models/department.model';
import { AddDepartmentComponent } from '../../components/add-department/add-department.component';
import { UpdateDepartmentComponent } from '../../components/update-department/update-department.component';

@Component({
  selector: 'app-department-managment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    HeaderComponent,
    AddDepartmentComponent,
    UpdateDepartmentComponent
  ],
  templateUrl: './department-managment.component.html',
  styleUrl: './department-managment.component.scss'
})
export class DepartmentManagmentComponent implements OnInit {
  departments: DepartmentResponse[] = [];
  filteredDepartments: DepartmentResponse[] = [];
  stats: DepartmentStatsResponse | null = null;
  keyword = '';

  // Modal state
  isAddModalVisible = false;
  isUpdateModalVisible = false;
  selectedDepartment: DepartmentResponse | null = null;

  constructor(private departmentService: DepartmentService) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadDepartments();
  }

  loadStats(): void {
    this.departmentService.getStats().subscribe({
      next: (res) => this.stats = res,
      error: (err) => console.error('Failed to load stats', err)
    });
  }

  loadDepartments(): void {
    this.departmentService.getDepartments().subscribe({
      next: (res) => {
        this.departments = res;
        this.applyFilter();
      },
      error: (err) => console.error('Failed to load departments', err)
    });
  }

  onSearch(event: any): void {
    this.keyword = event.target.value;
    this.applyFilter();
  }

  applyFilter(): void {
    const kw = this.keyword.toLowerCase();
    this.filteredDepartments = this.departments.filter(d =>
      d.code.toLowerCase().includes(kw) || d.name.toLowerCase().includes(kw)
    );
  }

  // --- Add Modal ---
  showAddModal(): void {
    this.isAddModalVisible = true;
  }

  hideAddModal(): void {
    this.isAddModalVisible = false;
  }

  onSaveDepartment(request: AddDepartmentRequest): void {
    this.departmentService.createDepartment(request).subscribe({
      next: () => {
        this.hideAddModal();
        this.loadDepartments();
        this.loadStats();
      },
      error: (err) => console.error('Failed to create department', err)
    });
  }

  // --- Update Modal ---
  showUpdateModal(dept: DepartmentResponse): void {
    this.selectedDepartment = dept;
    this.isUpdateModalVisible = true;
  }

  hideUpdateModal(): void {
    this.isUpdateModalVisible = false;
    this.selectedDepartment = null;
  }

  onUpdateDepartment(event: { id: number, data: AddDepartmentRequest }): void {
    this.departmentService.updateDepartment(event.id, event.data).subscribe({
      next: () => {
        this.hideUpdateModal();
        this.loadDepartments();
        this.loadStats();
      },
      error: (err) => console.error('Failed to update department', err)
    });
  }

  // --- Delete ---
  onDeleteDepartment(id: number): void {
    if (confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      this.departmentService.deleteDepartment(id).subscribe({
        next: () => {
          this.loadDepartments();
          this.loadStats();
        },
        error: (err) => console.error('Failed to delete department', err)
      });
    }
  }
}
