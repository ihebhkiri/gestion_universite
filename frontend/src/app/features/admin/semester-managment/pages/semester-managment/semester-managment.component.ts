import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SidebarComponent } from '../../../../../shared/components/admin/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../../shared/components/admin/header/header.component';
import { SemesterService } from '../../services/semester.service';
import { AcademicYearOption, AddSemesterRequest, SemesterResponse, SemesterStatsResponse } from '../../models/semester.model';
import { AddSemesterComponent } from '../../components/add-semester/add-semester.component';
import { UpdateSemesterComponent } from '../../components/update-semester/update-semester.component';

@Component({
  selector: 'app-semester-managment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    HeaderComponent,
    AddSemesterComponent,
    UpdateSemesterComponent
  ],
  templateUrl: './semester-managment.component.html',
  styleUrl: './semester-managment.component.scss'
})
export class SemesterManagmentComponent implements OnInit {
  semesters: SemesterResponse[] = [];
  filteredSemesters: SemesterResponse[] = [];
  stats: SemesterStatsResponse | null = null;
  academicYears: AcademicYearOption[] = [];
  keyword = '';

  isAddModalVisible = false;
  isUpdateModalVisible = false;
  selectedSemester: SemesterResponse | null = null;

  constructor(private semesterService: SemesterService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    forkJoin({
      semesters: this.semesterService.getSemesters(),
      stats: this.semesterService.getStats(),
      academicYears: this.semesterService.getAcademicYears()
    }).subscribe({
      next: (res) => {
        this.semesters = res.semesters;
        this.stats = res.stats;
        this.academicYears = res.academicYears;
        this.applyFilter();
      },
      error: (err) => console.error('Failed to load semesters', err)
    });
  }

  onSearch(event: Event): void {
    this.keyword = (event.target as HTMLInputElement).value;
    this.applyFilter();
  }

  applyFilter(): void {
    const kw = this.keyword.toLowerCase().trim();
    this.filteredSemesters = this.semesters.filter(s =>
      s.name.toLowerCase().includes(kw) ||
      s.academicYearLabel?.toLowerCase().includes(kw) ||
      s.status.toLowerCase().includes(kw)
    );
  }

  showAddModal(): void {
    this.isAddModalVisible = true;
  }

  hideAddModal(): void {
    this.isAddModalVisible = false;
  }

  onCreateSemester(request: AddSemesterRequest): void {
    this.semesterService.create(request).subscribe({
      next: () => {
        this.hideAddModal();
        this.loadAll();
      },
      error: (err) => console.error('Failed to create semester', err)
    });
  }

  showUpdateModal(semester: SemesterResponse): void {
    this.selectedSemester = semester;
    this.isUpdateModalVisible = true;
  }

  hideUpdateModal(): void {
    this.isUpdateModalVisible = false;
    this.selectedSemester = null;
  }

  onUpdateSemester(event: { id: number; request: AddSemesterRequest }): void {
    this.semesterService.update(event.id, event.request).subscribe({
      next: () => {
        this.hideUpdateModal();
        this.loadAll();
      },
      error: (err) => console.error('Failed to update semester', err)
    });
  }

  onDeleteSemester(id: number): void {
    if (!confirm('Delete this semester?')) {
      return;
    }
    this.semesterService.delete(id).subscribe({
      next: () => this.loadAll(),
      error: (err) => console.error('Failed to delete semester', err)
    });
  }
}

