import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SidebarComponent } from '../../../../../shared/components/admin/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../../shared/components/admin/header/header.component';
import { AcademicYearService } from '../../services/academic-year.service';
import { AcademicYearResponse, AcademicYearStatsResponse, AddAcademicYearRequest } from '../../models/academic-year.model';
import { AddAcademicYearComponent } from '../../components/add-academic-year/add-academic-year.component';
import { UpdateAcademicYearComponent } from '../../components/update-academic-year/update-academic-year.component';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-academic-year-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    HeaderComponent,
    AddAcademicYearComponent,
    UpdateAcademicYearComponent
  ],
  templateUrl: './academic-year-management.component.html',
  styleUrl: './academic-year-management.component.scss'
})
export class AcademicYearManagementComponent implements OnInit {
  years: AcademicYearResponse[] = [];
  filteredYears: AcademicYearResponse[] = [];
  stats: AcademicYearStatsResponse | null = null;
  keyword = '';

  isAddModalVisible = false;
  isUpdateModalVisible = false;
  selectedYear: AcademicYearResponse | null = null;

  constructor(private academicYearService: AcademicYearService,private toastr:ToastrService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    forkJoin({
      years: this.academicYearService.getAll(),
      stats: this.academicYearService.getStats()
    }).subscribe({
      next: (res) => {
        this.years = res.years;
        this.stats = res.stats;
        this.applyFilter();
      },
      error: (err) => this.toastr.error('Failed to load academic years', err)
    });
  }

  onSearch(event: Event): void {
    this.keyword = (event.target as HTMLInputElement).value;
    this.applyFilter();
  }

  applyFilter(): void {
    const kw = this.keyword.toLowerCase().trim();
    this.filteredYears = this.years.filter(y => y.label.toLowerCase().includes(kw));
  }

  showAddModal(): void {
    this.isAddModalVisible = true;
  }

  hideAddModal(): void {
    this.isAddModalVisible = false;
  }

  onCreateYear(request: AddAcademicYearRequest): void {
    this.academicYearService.create(request).subscribe({
      next: () => {
        this.hideAddModal();
        this.loadAll();
      },
      error: (err) => this.toastr.error('Failed to create academic year', err)
    });
  }

  showUpdateModal(year: AcademicYearResponse): void {
    this.selectedYear = year;
    this.isUpdateModalVisible = true;
  }

  hideUpdateModal(): void {
    this.isUpdateModalVisible = false;
    this.selectedYear = null;
  }

  onUpdateYear(event: { id: number; request: AddAcademicYearRequest }): void {
    this.academicYearService.update(event.id, event.request).subscribe({
      next: () => {
        this.hideUpdateModal();
        this.loadAll();
      },
      error: (err) => this.toastr.error('Failed to update academic year', err)
    });
  }

  onDeleteYear(id: number): void {
    if (!confirm('Delete this academic year?')) {
      return;
    }
    this.academicYearService.delete(id).subscribe({
      next: () => this.loadAll(),
      error: (err) => this.toastr.error('Failed to delete academic year', err)
    });
  }
}

