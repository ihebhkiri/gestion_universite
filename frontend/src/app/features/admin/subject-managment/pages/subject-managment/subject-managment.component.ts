import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SidebarComponent } from '../../../../../shared/components/admin/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../../shared/components/admin/header/header.component';
import { SubjectService } from '../../services/subject.service';
import { AddSubjectRequest, SubjectResponse, SubjectStatsResponse } from '../../models/subject.model';
import { AddSubjectComponent } from '../../components/add-subject/add-subject.component';
import { UpdateSubjectComponent } from '../../components/update-subject/update-subject.component';

@Component({
  selector: 'app-subject-managment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    HeaderComponent,
    AddSubjectComponent,
    UpdateSubjectComponent
  ],
  templateUrl: './subject-managment.component.html',
  styleUrl: './subject-managment.component.scss'
})
export class SubjectManagmentComponent implements OnInit {
  subjects: SubjectResponse[] = [];
  filteredSubjects: SubjectResponse[] = [];
  stats: SubjectStatsResponse | null = null;
  keyword = '';

  isAddModalVisible = false;
  isUpdateModalVisible = false;
  selectedSubject: SubjectResponse | null = null;

  constructor(private subjectService: SubjectService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    forkJoin({
      subjects: this.subjectService.getSubjects(),
      stats: this.subjectService.getStats()
    }).subscribe({
      next: (res) => {
        this.subjects = res.subjects;
        this.stats = res.stats;
        this.applyFilter();
      },
      error: (err) => console.error('Failed to load subjects', err)
    });
  }

  onSearch(event: Event): void {
    this.keyword = (event.target as HTMLInputElement).value;
    this.applyFilter();
  }

  applyFilter(): void {
    const kw = this.keyword.toLowerCase().trim();
    this.filteredSubjects = this.subjects.filter(subject =>
      subject.subjectName.toLowerCase().includes(kw)
    );
  }

  showAddModal(): void {
    this.isAddModalVisible = true;
  }

  hideAddModal(): void {
    this.isAddModalVisible = false;
  }

  onCreateSubject(request: AddSubjectRequest): void {
    this.subjectService.createSubject(request).subscribe({
      next: () => {
        this.hideAddModal();
        this.loadAll();
      },
      error: (err) => console.error('Failed to create subject', err)
    });
  }

  showUpdateModal(subject: SubjectResponse): void {
    this.selectedSubject = subject;
    this.isUpdateModalVisible = true;
  }

  hideUpdateModal(): void {
    this.isUpdateModalVisible = false;
    this.selectedSubject = null;
  }

  onUpdateSubject(event: { id: number; request: AddSubjectRequest }): void {
    this.subjectService.updateSubject(event.id, event.request).subscribe({
      next: () => {
        this.hideUpdateModal();
        this.loadAll();
      },
      error: (err) => console.error('Failed to update subject', err)
    });
  }

  onDeleteSubject(id: number): void {
    if (!confirm('Are you sure you want to delete this subject?')) {
      return;
    }
    this.subjectService.deleteSubject(id).subscribe({
      next: () => this.loadAll(),
      error: (err) => console.error('Failed to delete subject', err)
    });
  }
}
