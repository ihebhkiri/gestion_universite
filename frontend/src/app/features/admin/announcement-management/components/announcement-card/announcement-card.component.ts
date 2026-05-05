import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AnnouncementLike} from '../announcement-ui.types';

@Component({
  selector: 'app-announcement-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './announcement-card.component.html',
  styleUrl: './announcement-card.component.scss'
})
export class AnnouncementCardComponent {
  @Input() announcement: AnnouncementLike | null = null;
  @Output() edit = new EventEmitter<AnnouncementLike>();
  @Output() publish = new EventEmitter<AnnouncementLike>();
  @Output() schedule = new EventEmitter<AnnouncementLike>();
  @Output() archive = new EventEmitter<AnnouncementLike>();
  @Output() pin = new EventEmitter<AnnouncementLike>();
  @Output() unpin = new EventEmitter<AnnouncementLike>();
  @Output() viewDetails = new EventEmitter<AnnouncementLike>();

  get content(): string {
    return this.announcement?.content ?? this.announcement?.body ?? '';
  }

  get status(): string {
    return `${this.announcement?.status ?? 'DRAFT'}`.toUpperCase();
  }

  get priority(): string {
    return `${this.announcement?.priority ?? 'NORMAL'}`.toUpperCase();
  }

  get audience(): string {
    return 'PUBLIC';
  }

  get dateLabel(): string {
    const date = this.announcement?.publishedAt ?? this.announcement?.scheduledAt ?? this.announcement?.createdAt;
    return date ? new Intl.DateTimeFormat('fr-FR', {day: '2-digit', month: 'short', year: 'numeric'}).format(new Date(date)) : 'Non datee';
  }

  emit(action: EventEmitter<AnnouncementLike>): void {
    if (this.announcement) action.emit(this.announcement);
  }
}
