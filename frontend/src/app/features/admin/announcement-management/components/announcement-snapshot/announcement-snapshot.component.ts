import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AnnouncementLike} from '../announcement-ui.types';

@Component({
  selector: 'app-announcement-snapshot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './announcement-snapshot.component.html',
  styleUrl: './announcement-snapshot.component.scss'
})
export class AnnouncementSnapshotComponent {
  @Input() announcements: AnnouncementLike[] | null = [];
  @Output() viewDetails = new EventEmitter<AnnouncementLike>();

  get pinned(): AnnouncementLike[] {
    return (this.announcements ?? []).filter(item => item.pinned).slice(0, 4);
  }

  get urgent(): AnnouncementLike[] {
    return (this.announcements ?? [])
      .filter(item => {
        const priority = `${item.priority ?? ''}`.toUpperCase();
        const type = `${item.type ?? ''}`.toUpperCase();
        return item.urgent || type === 'URGENT' || priority === 'HIGH' || priority === 'CRITICAL';
      })
      .slice(0, 4);
  }

  get timeline(): AnnouncementLike[] {
    return [...(this.announcements ?? [])]
      .sort((a, b) => this.time(b.createdAt ?? b.publishedAt ?? b.scheduledAt) - this.time(a.createdAt ?? a.publishedAt ?? a.scheduledAt))
      .slice(0, 5);
  }

  dateLabel(value: string | Date | null | undefined): string {
    return value ? new Intl.DateTimeFormat('fr-FR', {day: '2-digit', month: 'short'}).format(new Date(value)) : '-';
  }

  private time(value: string | Date | null | undefined): number {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime()) ? date.getTime() : 0;
  }
}
