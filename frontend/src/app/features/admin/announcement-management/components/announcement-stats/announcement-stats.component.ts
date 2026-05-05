import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';
import {AnnouncementLike, AnnouncementStatsLike} from '../announcement-ui.types';

interface StatCard {
  label: string;
  value: string;
  icon: string;
  tone: string;
}

@Component({
  selector: 'app-announcement-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './announcement-stats.component.html',
  styleUrl: './announcement-stats.component.scss'
})
export class AnnouncementStatsComponent {
  @Input() stats: AnnouncementStatsLike | null = null;
  @Input() announcements: AnnouncementLike[] | null = [];

  get cards(): StatCard[] {
    return [
      {label: 'Publiees', value: `${this.published}`, icon: 'campaign', tone: 'green'},
      {label: 'Programmees', value: `${this.scheduled}`, icon: 'schedule_send', tone: 'blue'},
      {label: 'Urgentes', value: `${this.urgent}`, icon: 'priority_high', tone: 'red'},
      {label: 'Archivees', value: `${this.archived}`, icon: 'inventory_2', tone: 'slate'},
      {label: 'Vues totales', value: `${this.totalViews}`, icon: 'visibility', tone: 'cyan'},
      {label: 'Prochaine publication', value: this.nextPublicationLabel, icon: 'event_upcoming', tone: 'orange'}
    ];
  }

  private get published(): number {
    return this.number(this.stats?.published ?? this.stats?.publishedCount) || this.countStatus('PUBLISHED');
  }

  private get scheduled(): number {
    return this.number(this.stats?.scheduled ?? this.stats?.scheduledCount) || this.countStatus('SCHEDULED');
  }

  private get urgent(): number {
    return this.number(this.stats?.urgent ?? this.stats?.urgentCount)
      || (this.announcements ?? []).filter(item => this.isUrgent(item)).length;
  }

  private get archived(): number {
    return this.number(this.stats?.archived ?? this.stats?.archivedCount) || this.countStatus('ARCHIVED');
  }

  private get totalViews(): number {
    const direct = this.number(this.stats?.totalViews ?? this.stats?.viewsTotal);
    if (direct) return direct;
    return (this.announcements ?? []).reduce((sum, item) => sum + this.number(item.views ?? item.viewCount), 0);
  }

  private get nextPublicationLabel(): string {
    const direct = this.stats?.nextPublication ?? this.stats?.nextScheduledAt;
    const next = direct ?? (this.announcements ?? [])
      .map(item => item.scheduledAt)
      .filter(Boolean)
      .map(value => new Date(value as string | Date))
      .filter(date => !Number.isNaN(date.getTime()) && date.getTime() >= Date.now())
      .sort((a, b) => a.getTime() - b.getTime())[0];
    return next ? new Intl.DateTimeFormat('fr-FR', {day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'}).format(new Date(next)) : '-';
  }

  private countStatus(status: string): number {
    return (this.announcements ?? []).filter(item => `${item.status ?? ''}`.toUpperCase() === status).length;
  }

  private isUrgent(item: AnnouncementLike): boolean {
    const priority = `${item.priority ?? ''}`.toUpperCase();
    const type = `${item.type ?? ''}`.toUpperCase();
    return item.urgent === true || type === 'URGENT' || priority === 'HIGH' || priority === 'CRITICAL';
  }

  private number(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
  }
}
