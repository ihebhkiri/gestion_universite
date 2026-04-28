import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {SidebarComponent} from '../../../../../shared/components/admin/sidebar/sidebar.component';
import {HeaderComponent} from '../../../../../shared/components/admin/header/header.component';
import {ProgramService} from '../../services/program.service';
import {ProgramResponse, ProgramStatsResponse, AddProgramRequest, DepartmentOption} from '../../models/program.model';
import {AddProgramComponent} from '../../components/add-program/add-program.component';
import {UpdateProgramComponent} from '../../components/update-program/update-program.component';
import {forkJoin} from 'rxjs';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'app-program-managment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    HeaderComponent,
    AddProgramComponent,
    UpdateProgramComponent
  ],
  templateUrl: './program-managment.component.html',
  styleUrl: './program-managment.component.scss'
})
export class ProgramManagmentComponent implements OnInit {
  programs: ProgramResponse[] = [];
  filteredPrograms: ProgramResponse[] = [];
  stats: ProgramStatsResponse | null = null;
  departments: DepartmentOption[] = [];
  keyword = '';

  isAddModalVisible = false;
  isUpdateModalVisible = false;
  selectedProgram: ProgramResponse | null = null;

  constructor(private programService: ProgramService, private toastr: ToastrService) {
  }

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    forkJoin({
      programs: this.programService.getPrograms(),
      stats: this.programService.getStats(),
      departments: this.programService.getDepartments()
    }).subscribe({
      next: (res) => {
        this.programs = res.programs;
        this.stats = res.stats;
        this.departments = res.departments;
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
    this.filteredPrograms = this.programs.filter(p =>
      p.code.toLowerCase().includes(kw) ||
      p.name.toLowerCase().includes(kw) ||
      (p.departmentName && p.departmentName.toLowerCase().includes(kw))
    );
  }

  showAddModal(): void {
    this.isAddModalVisible = true;
  }

  hideAddModal(): void {
    this.isAddModalVisible = false;
  }

  onSaveProgram(event: { departmentId: number, request: AddProgramRequest }): void {
    this.programService.createProgram(event.departmentId, event.request).subscribe({
      next: () => {
        this.hideAddModal();
        this.loadAll();
      },
      error: (err) => this.toastr.error('Failed to create program', err.error)
    });
  }

  showUpdateModal(prog: ProgramResponse): void {
    this.selectedProgram = prog;
    this.isUpdateModalVisible = true;
  }

  hideUpdateModal(): void {
    this.isUpdateModalVisible = false;
    this.selectedProgram = null;
  }

  onUpdateProgram(event: { id: number, data: AddProgramRequest, newDepartmentId: number | null }): void {
    this.programService.updateProgram(event.id, event.data).subscribe({
      next: () => {
        if (event.newDepartmentId) {
          this.programService.updateProgramDepartment(event.id, event.newDepartmentId).subscribe({
            next: () => {
              this.hideUpdateModal();
              this.loadAll();
            },
            error: (err) => this.toastr.error('Failed to update department assignment', err)
          });
        } else {
          this.hideUpdateModal();
          this.loadAll();
        }
      },
      error: (err) => this.toastr.error('Failed to update program', err)
    });
  }

  onDeleteProgram(id: number): void {
    if (confirm('Are you sure you want to delete this program? This action cannot be undone.')) {
      this.programService.deleteProgram(id).subscribe({
        next: () => this.loadAll(),
        error: (err) => this.toastr.error('Failed to delete program', err)
      });
    }
  }
}
