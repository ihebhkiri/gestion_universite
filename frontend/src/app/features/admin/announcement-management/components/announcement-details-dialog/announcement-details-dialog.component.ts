import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {AnnouncementLike} from '../announcement-ui.types';

@Component({
  selector: 'app-announcement-details-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './announcement-details-dialog.component.html',
  styleUrl: './announcement-details-dialog.component.scss'
})
export class AnnouncementDetailsDialogComponent {
  @Input() visible = false;
  @Input() announcement: AnnouncementLike | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() edit = new EventEmitter<AnnouncementLike>();

  get content(): string {
    return this.announcement?.content ?? this.announcement?.body ?? '';
  }

  get attachments(): string[] {
    return (this.announcement?.attachmentUrl ?? '')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }

  dateLabel(value: string | Date | null | undefined): string {
    return value ? new Intl.DateTimeFormat('fr-FR', {dateStyle: 'medium', timeStyle: 'short'}).format(new Date(value)) : '-';
  }

  attachmentLabel(value: string): string {
    try {
      const pathname = new URL(value).pathname;
      return decodeURIComponent(pathname.substring(pathname.lastIndexOf('/') + 1)) || 'Piece jointe';
    } catch {
      return value;
    }
  }
}
