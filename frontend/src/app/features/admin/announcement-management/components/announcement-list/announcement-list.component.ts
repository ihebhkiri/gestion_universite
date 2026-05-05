import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AnnouncementCardComponent} from '../announcement-card/announcement-card.component';
import {AnnouncementFiltersValue, AnnouncementLike} from '../announcement-ui.types';

@Component({
  selector: 'app-announcement-list',
  standalone: true,
  imports: [CommonModule, AnnouncementCardComponent],
  templateUrl: './announcement-list.component.html',
  styleUrl: './announcement-list.component.scss'
})
export class AnnouncementListComponent {
  @Input() announcements: AnnouncementLike[] | null = [];
  @Input() filters: AnnouncementFiltersValue | null = null;
  @Input() loading = false;
  @Output() edit = new EventEmitter<AnnouncementLike>();
  @Output() publish = new EventEmitter<AnnouncementLike>();
  @Output() schedule = new EventEmitter<AnnouncementLike>();
  @Output() archive = new EventEmitter<AnnouncementLike>();
  @Output() pin = new EventEmitter<AnnouncementLike>();
  @Output() unpin = new EventEmitter<AnnouncementLike>();
  @Output() viewDetails = new EventEmitter<AnnouncementLike>();

  get filteredAnnouncements(): AnnouncementLike[] {
    const items = this.announcements ?? [];
    const filters = this.filters;
    if (!filters) return items;
    const search = filters.search.trim().toLowerCase();
    return items.filter(item => {
      const content = `${item.title ?? ''} ${item.content ?? item.body ?? ''}`.toLowerCase();
      return (!search || content.includes(search))
        && this.matches(filters.type, item.type)
        && this.matches(filters.priority, item.priority)
        && this.matches(filters.status, item.status);
    });
  }

  private matches(filter: string, value: unknown): boolean {
    return filter === 'ALL' || `${value ?? ''}`.toUpperCase() === filter;
  }
}
