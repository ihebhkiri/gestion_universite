import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {AnnouncementFiltersValue} from '../announcement-ui.types';

@Component({
  selector: 'app-announcement-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './announcement-filters.component.html',
  styleUrl: './announcement-filters.component.scss'
})
export class AnnouncementFiltersComponent implements OnChanges {
  @Input() filters: AnnouncementFiltersValue | null = null;
  @Output() filterChanged = new EventEmitter<AnnouncementFiltersValue>();

  value: AnnouncementFiltersValue = {
    search: '',
    type: 'ALL',
    priority: 'ALL',
    status: 'ALL'
  };

  readonly types = ['ALL', 'INFO', 'WARNING', 'URGENT', 'EVENT', 'DEADLINE'];
  readonly priorities = ['ALL', 'LOW', 'NORMAL', 'HIGH', 'CRITICAL'];
  readonly statuses = ['ALL', 'DRAFT', 'PUBLISHED', 'SCHEDULED', 'ARCHIVED'];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters'] && this.filters) {
      this.value = {...this.value, ...this.filters};
    }
  }

  emit(): void {
    this.filterChanged.emit({...this.value});
  }

  reset(): void {
    this.value = {search: '', type: 'ALL', priority: 'ALL', status: 'ALL'};
    this.emit();
  }
}
