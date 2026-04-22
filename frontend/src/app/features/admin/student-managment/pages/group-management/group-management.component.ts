import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SidebarComponent } from '../../../../../shared/components/admin/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../../shared/components/admin/header/header.component';
import { GroupService } from '../../services/group.service';
import { AcademicClassOption, AddGroupRequest, GroupResponse, GroupStatsResponse } from '../../models/group.model';
import { AddGroupComponent } from '../../components/add-group/add-group.component';
import { UpdateGroupComponent } from '../../components/update-group/update-group.component';

@Component({
  selector: 'app-group-management',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent, AddGroupComponent, UpdateGroupComponent],
  templateUrl: './group-management.component.html',
  styleUrl: './group-management.component.scss'
})
export class GroupManagementComponent implements OnInit {
  groups: GroupResponse[] = [];
  filteredGroups: GroupResponse[] = [];
  stats: GroupStatsResponse | null = null;
  classes: AcademicClassOption[] = [];
  keyword = '';

  isAddModalVisible = false;
  isUpdateModalVisible = false;
  selectedGroup: GroupResponse | null = null;

  constructor(private groupService: GroupService) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    forkJoin({
      groups: this.groupService.getGroups(),
      stats: this.groupService.getStats(),
      classes: this.groupService.getClasses()
    }).subscribe({
      next: (res) => {
        this.groups = res.groups;
        this.stats = res.stats;
        this.classes = res.classes;
        this.applyFilter();
      },
      error: (err) => console.error('Failed to load groups data', err)
    });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.keyword = value;
    this.applyFilter();
  }

  applyFilter(): void {
    const kw = this.keyword.toLowerCase().trim();
    this.filteredGroups = this.groups.filter(group =>
      group.name.toLowerCase().includes(kw) ||
      group.classCode?.toLowerCase().includes(kw)
    );
  }

  showAddModal(): void {
    this.isAddModalVisible = true;
  }

  hideAddModal(): void {
    this.isAddModalVisible = false;
  }

  onCreateGroup(request: AddGroupRequest): void {
    this.groupService.addGroup(request).subscribe({
      next: () => {
        this.hideAddModal();
        this.loadAll();
      },
      error: (err) => console.error('Failed to create group', err)
    });
  }

  showUpdateModal(group: GroupResponse): void {
    this.selectedGroup = group;
    this.isUpdateModalVisible = true;
  }

  hideUpdateModal(): void {
    this.isUpdateModalVisible = false;
    this.selectedGroup = null;
  }

  onUpdateGroup(event: { id: number; request: AddGroupRequest }): void {
    this.groupService.updateGroup(event.id, event.request).subscribe({
      next: () => {
        this.hideUpdateModal();
        this.loadAll();
      },
      error: (err) => console.error('Failed to update group', err)
    });
  }

  onDeleteGroup(id: number): void {
    if (!confirm('Delete this group?')) {
      return;
    }
    this.groupService.deleteGroup(id).subscribe({
      next: () => this.loadAll(),
      error: (err) => console.error('Failed to delete group', err)
    });
  }
}
