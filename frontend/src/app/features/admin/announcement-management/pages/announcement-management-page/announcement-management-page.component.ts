import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {animate, style, transition, trigger} from '@angular/animations';
import {Observable, of} from 'rxjs';
import {HeaderComponent} from '../../../../../shared/components/admin/header/header.component';
import {SidebarComponent} from '../../../../../shared/components/admin/sidebar/sidebar.component';
import {AnnouncementStateService} from '../../services/announcement-state.service';
import {AnnouncementFacade} from '../../facades/announcement.facade';
import {AnnouncementDetailsDialogComponent} from '../../components/announcement-details-dialog/announcement-details-dialog.component';
import {AnnouncementEditorDialogComponent} from '../../components/announcement-editor-dialog/announcement-editor-dialog.component';
import {AnnouncementFiltersComponent} from '../../components/announcement-filters/announcement-filters.component';
import {AnnouncementHeaderComponent} from '../../components/announcement-header/announcement-header.component';
import {AnnouncementHeroSliderComponent} from '../../components/announcement-hero-slider/announcement-hero-slider.component';
import {AnnouncementListComponent} from '../../components/announcement-list/announcement-list.component';
import {AnnouncementSnapshotComponent} from '../../components/announcement-snapshot/announcement-snapshot.component';
import {AnnouncementStatsComponent} from '../../components/announcement-stats/announcement-stats.component';
import {
  AnnouncementEditorPayload,
  AnnouncementFiltersValue,
  AnnouncementLike,
  AnnouncementStatsLike
} from '../../components/announcement-ui.types';

@Component({
  selector: 'app-announcement-management-page',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    HeaderComponent,
    AnnouncementHeaderComponent,
    AnnouncementHeroSliderComponent,
    AnnouncementStatsComponent,
    AnnouncementFiltersComponent,
    AnnouncementListComponent,
    AnnouncementSnapshotComponent,
    AnnouncementEditorDialogComponent,
    AnnouncementDetailsDialogComponent
  ],
  providers: [AnnouncementStateService, AnnouncementFacade],
  templateUrl: './announcement-management-page.component.html',
  styleUrl: './announcement-management-page.component.scss',
  animations: [
    trigger('pageFade', [
      transition(':enter', [
        style({opacity: 0, transform: 'translateY(10px)'}),
        animate('220ms ease-out', style({opacity: 1, transform: 'translateY(0)'}))
      ])
    ])
  ]
})
export class AnnouncementManagementPageComponent implements OnInit {
  readonly announcements$: Observable<AnnouncementLike[]>;
  readonly stats$: Observable<AnnouncementStatsLike | null>;
  readonly loading$: Observable<boolean>;

  filters: AnnouncementFiltersValue = {
    search: '',
    type: 'ALL',
    priority: 'ALL',
    status: 'ALL'
  };

  editorOpen = false;
  detailsOpen = false;
  selectedAnnouncement: AnnouncementLike | null = null;

  private readonly facade: Record<string, any>;

  constructor(facade: AnnouncementFacade) {
    this.facade = facade as Record<string, any>;
    this.announcements$ = this.pickStream<AnnouncementLike[]>([
      'filteredAnnouncements$',
      'announcements$',
      'items$',
      'announcementList$'
    ], []);
    this.stats$ = this.pickStream<AnnouncementStatsLike | null>(['stats$', 'summary$', 'announcementStats$'], null);
    this.loading$ = this.pickStream<boolean>(['loading$', 'localLoading$', 'isLoading$'], false);
  }

  ngOnInit(): void {
    this.callFacade(['init', 'loadAnnouncements', 'loadAll', 'loadInitialData']);
    this.callFacade(['loadStats']);
  }

  create(): void {
    this.selectedAnnouncement = null;
    this.editorOpen = true;
  }

  edit(announcement: AnnouncementLike): void {
    this.selectedAnnouncement = announcement;
    this.detailsOpen = false;
    this.editorOpen = true;
  }

  closeEditor(): void {
    this.editorOpen = false;
    this.selectedAnnouncement = null;
  }

  save(payload: AnnouncementEditorPayload): void {
    if (payload.id !== null && payload.id !== undefined) {
      this.callFacade(['update', 'updateAnnouncement', 'saveAnnouncement'], payload.id, payload);
    } else {
      this.callFacade(['create', 'createAnnouncement', 'saveAnnouncement'], payload);
    }
    this.closeEditor();
  }

  publish(announcement: AnnouncementLike): void {
    this.callAnnouncementAction(['publish', 'publishAnnouncement'], announcement);
  }

  schedule(announcement: AnnouncementLike): void {
    if (announcement.id !== undefined && announcement.scheduledAt) {
      this.callFacade(['scheduleAnnouncement'], announcement.id, {
        scheduledAt: announcement.scheduledAt,
        expiresAt: announcement.expiresAt ?? null
      });
      return;
    }
    this.selectedAnnouncement = announcement;
    this.editorOpen = true;
  }

  archive(announcement: AnnouncementLike): void {
    this.callAnnouncementAction(['archive', 'archiveAnnouncement'], announcement);
  }

  pin(announcement: AnnouncementLike): void {
    this.callAnnouncementAction(['pin', 'pinAnnouncement'], announcement);
  }

  unpin(announcement: AnnouncementLike): void {
    this.callAnnouncementAction(['unpin', 'unpinAnnouncement'], announcement);
  }

  viewDetails(announcement: AnnouncementLike): void {
    this.selectedAnnouncement = announcement;
    this.detailsOpen = true;
    this.callFacade(['selectAnnouncement'], announcement);
    if (announcement.id !== undefined) {
      this.callFacade(['loadAnnouncementDetails'], announcement.id);
    }
  }

  closeDetails(): void {
    this.detailsOpen = false;
    this.selectedAnnouncement = null;
    this.callFacade(['selectAnnouncement'], null);
  }

  onFilterChanged(filters: AnnouncementFiltersValue): void {
    this.filters = filters;
    this.callFacade(['setFilters', 'updateFilters', 'filterChanged'], {
      search: filters.search,
      type: filters.type === 'ALL' ? '' : filters.type,
      priority: filters.priority === 'ALL' ? '' : filters.priority,
      status: filters.status === 'ALL' ? '' : filters.status,
      audienceType: ''
    });
  }

  private callAnnouncementAction(names: string[], announcement: AnnouncementLike): void {
    this.callFacade(names, announcement.id ?? announcement);
  }

  private pickStream<T>(names: string[], fallback: T): Observable<T> {
    const stream = names.map(name => this.facade[name]).find(value => value && typeof value.subscribe === 'function');
    return stream ?? of(fallback);
  }

  private callFacade(names: string[], ...args: unknown[]): void {
    const name = names.find(candidate => typeof this.facade[candidate] === 'function');
    if (name) {
      this.facade[name](...args);
    }
  }
}
