import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../../../shared/components/admin/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../../shared/components/admin/header/header.component';
import { SpecialityService } from '../../services/speciality.service';
import { SpecialityResponse, SpecialityStatsResponse, AddSpecialityRequest, ProgramOption } from '../../models/speciality.model';
import { AddSpecialityComponent } from '../../components/add-speciality/add-speciality.component';
import { UpdateSpecialityComponent } from '../../components/update-speciality/update-speciality.component';
import { forkJoin } from 'rxjs';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-speciality-managment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    HeaderComponent,
    AddSpecialityComponent,
    UpdateSpecialityComponent
  ],
  templateUrl: './speciality-managment.component.html',
  styleUrl: './speciality-managment.component.scss'
})
export class SpecialityManagmentComponent implements OnInit {
  specialities: SpecialityResponse[] = [];
  filteredSpecialities: SpecialityResponse[] = [];
  stats: SpecialityStatsResponse | null = null;
  programs: ProgramOption[] = [];
  keyword = '';

  // Modal state
  isAddModalVisible = false;
  isUpdateModalVisible = false;
  selectedSpeciality: SpecialityResponse | null = null;

  constructor(private specialityService: SpecialityService , private toastr:ToastrService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    forkJoin({
      specialities: this.specialityService.getSpecialities(),
      stats: this.specialityService.getStats(),
      programs: this.specialityService.getPrograms()
    }).subscribe({
      next: (res) => {
        this.specialities = res.specialities;
        this.stats = res.stats;
        this.programs = res.programs;
        this.applyFilter();
      },
      error: (err) => this.toastr.error('Failed to load data', err)
    });
  }

  onSearch(event: any): void {
    this.keyword = event.target.value;
    this.applyFilter();
  }

  applyFilter(): void {
    const kw = this.keyword.toLowerCase();
    this.filteredSpecialities = this.specialities.filter(s =>
      s.code.toLowerCase().includes(kw) ||
      s.name.toLowerCase().includes(kw) ||
      (s.programName && s.programName.toLowerCase().includes(kw))
    );
  }

  // --- Add ---
  showAddModal(): void {
    this.isAddModalVisible = true;
  }

  hideAddModal(): void {
    this.isAddModalVisible = false;
  }

  onSaveSpeciality(event: { programId: number, request: AddSpecialityRequest }): void {
    this.specialityService.createSpeciality(event.programId, event.request).subscribe({
      next: () => {
        this.hideAddModal();
        this.loadAll();
      },
      error: (err) => this.toastr.error('Failed to create speciality', err)
    });
  }

  // --- Update ---
  showUpdateModal(spec: SpecialityResponse): void {
    this.selectedSpeciality = spec;
    this.isUpdateModalVisible = true;
  }

  hideUpdateModal(): void {
    this.isUpdateModalVisible = false;
    this.selectedSpeciality = null;
  }

  onUpdateSpeciality(event: { id: number, data: AddSpecialityRequest, newProgramId: number | null }): void {
    this.specialityService.updateSpeciality(event.id, event.data).subscribe({
      next: () => {
        if (event.newProgramId) {
          this.specialityService.updateSpecialityProgram(event.id, event.newProgramId).subscribe({
            next: () => {
              this.hideUpdateModal();
              this.loadAll();
            },
            error: (err) => this.toastr.error('Failed to update program assignment', err)
          });
        } else {
          this.hideUpdateModal();
          this.loadAll();
        }
      },
      error: (err) => this.toastr.error('Failed to update speciality', err)
    });
  }

  // --- Delete ---
  onDeleteSpeciality(id: number): void {
    if (confirm('Are you sure you want to delete this speciality? This action cannot be undone.')) {
      this.specialityService.deleteSpeciality(id).subscribe({
        next: () => this.loadAll(),
        error: (err) => this.toastr.error('Failed to delete speciality', err)
      });
    }
  }
}
