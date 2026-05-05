import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {AnnouncementEditorPayload, AnnouncementLike} from '../announcement-ui.types';

interface AnnouncementEditorForm {
  id: number | string | null;
  title: string;
  content: string;
  type: string;
  priority: string;
  scheduledAt: string | null;
  expiresAt: string | null;
  externalLink: string;
  attachmentUrl: string;
  pinned: boolean;
}

@Component({
  selector: 'app-announcement-editor-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './announcement-editor-dialog.component.html',
  styleUrl: './announcement-editor-dialog.component.scss'
})
export class AnnouncementEditorDialogComponent implements OnChanges {
  @Input() visible = false;
  @Input() announcement: AnnouncementLike | null = null;
  @Input() loading = false;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<AnnouncementEditorPayload>();

  form: AnnouncementEditorForm = this.emptyForm();
  selectedAttachmentNames: string[] = [];
  selectedAttachmentFiles: File[] = [];

  readonly types = ['INFO', 'WARNING', 'URGENT', 'EVENT', 'DEADLINE'];
  readonly priorities = ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['announcement'] || changes['visible']) {
      this.form = this.announcement ? {
        id: this.announcement.id ?? null,
        title: this.announcement.title ?? '',
        content: this.announcement.content ?? this.announcement.body ?? '',
        type: this.announcement.type ?? 'INFO',
        priority: this.announcement.priority ?? 'NORMAL',
        scheduledAt: this.toInputDate(this.announcement.scheduledAt),
        expiresAt: this.toInputDate(this.announcement.expiresAt),
        externalLink: this.announcement.externalLink ?? '',
        attachmentUrl: this.announcement.attachmentUrl ?? '',
        pinned: this.announcement.pinned ?? false
      } : this.emptyForm();
      this.selectedAttachmentNames = this.splitAttachments(this.form.attachmentUrl);
      this.selectedAttachmentFiles = [];
    }
  }

  submit(): void {
    if (!this.form.title.trim() || !this.form.content.trim()) return;

    this.saved.emit({
      ...this.form,
      title: this.form.title.trim(),
      content: this.form.content.trim(),
      audienceType: 'ALL',
      audienceId: null,
      scheduledAt: this.form.scheduledAt || null,
      expiresAt: this.form.expiresAt || null,
      externalLink: this.form.externalLink.trim(),
      attachmentUrl: this.form.attachmentUrl.trim(),
      attachmentFiles: this.selectedAttachmentFiles
    });
  }

  onAttachmentChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.selectedAttachmentFiles = files;
    this.selectedAttachmentNames = files.map(file => file.name);
  }

  private emptyForm(): AnnouncementEditorForm {
    return {
      id: null,
      title: '',
      content: '',
      type: 'INFO',
      priority: 'NORMAL',
      scheduledAt: null,
      expiresAt: null,
      externalLink: '',
      attachmentUrl: '',
      pinned: false
    };
  }

  private splitAttachments(value: string | null | undefined): string[] {
    return (value ?? '')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }

  private toInputDate(value: string | Date | null | undefined): string | null {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  }
}
