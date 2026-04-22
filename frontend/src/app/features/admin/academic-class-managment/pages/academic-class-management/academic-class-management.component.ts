import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SidebarComponent } from '../../../../../shared/components/admin/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../../shared/components/admin/header/header.component';
import { AcademicClassService } from '../../services/academic-class.service';
import {
  AcademicClassResponse,
  AcademicClassStatsResponse,
  AddAcademicClassRequest,
  ProgramOption,
  SpecialityOption,
  AcademicYearOption
} from '../../models/academic-class.model';
import { AddClassComponent } from '../../components/add-class/add-class.component';
import { UpdateClassComponent } from '../../components/update-class/update-class.component';

@Component({
  selector: 'app-academic-class-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    HeaderComponent,
    AddClassComponent,
    UpdateClassComponent
  ],
  templateUrl: './academic-class-management.component.html',
  styleUrl: './academic-class-management.component.scss'
})
export class AcademicClassManagementComponent implements OnInit {
  classes: AcademicClassResponse[] = [];
  filteredClasses: AcademicClassResponse[] = [];
  stats: AcademicClassStatsResponse | null = null;
  programs: ProgramOption[] = [];
  specialities: SpecialityOption[] = [];
  academicYears: AcademicYearOption[] = [];
  keyword = '';

  isAddModalVisible = false;
  isUpdateModalVisible = false;
  selectedClass: AcademicClassResponse | null = null;

  constructor(private academicClassService: AcademicClassService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    forkJoin({
      classes: this.academicClassService.getClasses(),
      stats: this.academicClassService.getStats(),
      programs: this.academicClassService.getPrograms(),
      specialities: this.academicClassService.getSpecialities(),
      academicYears: this.academicClassService.getAcademicYears()
    }).subscribe({
      next: (res) => {
        this.classes = res.classes;
        this.stats = res.stats;
        this.programs = res.programs;
        this.specialities = res.specialities;
        this.academicYears = res.academicYears;
        this.applyFilter();
      },
      error: (err) => console.error('Failed to load classes data', err)
    });
  }

  onSearch(event: Event): void {
    this.keyword = (event.target as HTMLInputElement).value;
    this.applyFilter();
  }

  applyFilter(): void {
    const kw = this.keyword.toLowerCase().trim();
    this.filteredClasses = this.classes.filter(item =>
      item.code.toLowerCase().includes(kw) ||
      item.programCode?.toLowerCase().includes(kw) ||
      item.specialityCode?.toLowerCase().includes(kw) ||
      item.academicYearLabel?.toLowerCase().includes(kw)
    );
  }

  showAddModal(): void {
    this.isAddModalVisible = true;
  }

  hideAddModal(): void {
    this.isAddModalVisible = false;
  }

  onCreateClass(request: AddAcademicClassRequest): void {
    this.academicClassService.createClass(request).subscribe({
      next: () => {
        this.hideAddModal();
        this.loadAll();
      },
      error: (err) => console.error('Failed to create class', err)
    });
  }

  showUpdateModal(academicClass: AcademicClassResponse): void {
    this.selectedClass = academicClass;
    this.isUpdateModalVisible = true;
  }

  hideUpdateModal(): void {
    this.isUpdateModalVisible = false;
    this.selectedClass = null;
  }

  onUpdateClass(event: { id: number; request: AddAcademicClassRequest }): void {
    this.academicClassService.updateClass(event.id, event.request).subscribe({
      next: () => {
        this.hideUpdateModal();
        this.loadAll();
      },
      error: (err) => console.error('Failed to update class', err)
    });
  }

  onDeleteClass(id: number): void {
    if (!confirm('Are you sure you want to delete this class?')) {
      return;
    }
    this.academicClassService.deleteClass(id).subscribe({
      next: () => this.loadAll(),
      error: (err) => console.error('Failed to delete class', err)
    });
  }
}
