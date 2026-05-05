import {HttpErrorResponse} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  defer,
  distinctUntilChanged,
  finalize,
  map,
  switchMap
} from 'rxjs';
import {
  Announcement,
  AnnouncementFilters,
  AnnouncementPriority,
  AnnouncementStats,
  CreateAnnouncementPayload,
  EMPTY_ANNOUNCEMENT_FILTERS,
  EMPTY_ANNOUNCEMENT_STATS,
  ScheduleAnnouncementPayload,
  UpdateAnnouncementPayload
} from '../models/announcement-management.model';
import {AnnouncementApiService} from '../services/announcement-api.service';
import {AnnouncementStateService} from '../services/announcement-state.service';

@Injectable()
export class AnnouncementFacade {
  private readonly api = inject(AnnouncementApiService);
  private readonly state = inject(AnnouncementStateService);
  private readonly toastr = inject(ToastrService);
  private readonly pendingRequestsSubject = new BehaviorSubject<number>(0);

  readonly announcements$ = this.state.announcements$;
  readonly currentAnnouncement$ = this.state.currentAnnouncement$;
  readonly stats$ = this.state.stats$;
  readonly filters$ = this.state.filters$;
  readonly selectedAnnouncement$ = this.state.selectedAnnouncement$;
  readonly localLoading$ = combineLatest([
    this.state.localLoading$,
    this.pendingRequestsSubject.pipe(map(count => count > 0), distinctUntilChanged())
  ]).pipe(map(([stateLoading, pending]) => stateLoading || pending));
  readonly filteredAnnouncements$ = combineLatest([
    this.announcements$,
    this.filters$
  ]).pipe(map(([announcements, filters]) => this.filterAnnouncements(announcements, filters)));
  readonly featuredAnnouncements$ = this.announcements$.pipe(
    map(announcements => this.getFeaturedAnnouncements(announcements))
  );

  loadAnnouncements(): void {
    const filters = this.state.snapshot.filters;
    this.withLocalLoader(() => this.api.getAnnouncements(filters)).subscribe({
      next: announcements => {
        this.state.setAnnouncements(announcements);
        this.state.setStats(this.buildStats(announcements));
        this.syncCurrentAnnouncement(announcements);
      },
      error: error => this.handleError(error, 'Unable to load announcements.')
    });
  }

  loadAnnouncementDetails(id: number): void {
    this.withLocalLoader(() => this.api.getAnnouncement(id)).subscribe({
      next: announcement => this.state.upsertAnnouncement(announcement),
      error: error => this.handleError(error, 'Unable to load announcement details.')
    });
  }

  createAnnouncement(payload: CreateAnnouncementPayload): void {
    const attachmentFiles = this.extractAttachmentFiles(payload);
    this.withLocalLoader(() => this.api.createAnnouncement(this.normalizePayload(payload) as unknown as CreateAnnouncementPayload).pipe(
      switchMap(announcement => this.uploadAttachmentsIfNeeded(announcement, attachmentFiles))
    )).subscribe({
      next: announcement => {
        this.applyAnnouncement(announcement);
        this.toastr.success('Announcement created.');
      },
      error: error => this.handleError(error, 'Unable to create announcement.')
    });
  }

  updateAnnouncement(id: number, payload: UpdateAnnouncementPayload): void {
    const attachmentFiles = this.extractAttachmentFiles(payload);
    this.withLocalLoader(() => this.api.updateAnnouncement(id, this.normalizePayload(payload) as UpdateAnnouncementPayload).pipe(
      switchMap(announcement => this.uploadAttachmentsIfNeeded(announcement, attachmentFiles))
    )).subscribe({
      next: announcement => {
        this.applyAnnouncement(announcement);
        this.toastr.success('Announcement updated.');
      },
      error: error => this.handleError(error, 'Unable to update announcement.')
    });
  }

  publishAnnouncement(id: number): void {
    this.withLocalLoader(() => this.api.publishAnnouncement(id)).subscribe({
      next: announcement => this.applyAnnouncement(announcement, 'Announcement published.'),
      error: error => this.handleError(error, 'Unable to publish announcement.')
    });
  }

  scheduleAnnouncement(id: number, payload: ScheduleAnnouncementPayload): void {
    this.withLocalLoader(() => this.api.scheduleAnnouncement(id, {
      ...payload,
      scheduledAt: this.toApiDate(payload.scheduledAt) ?? payload.scheduledAt,
      expiresAt: this.toApiDate(payload.expiresAt)
    })).subscribe({
      next: announcement => this.applyAnnouncement(announcement, 'Announcement scheduled.'),
      error: error => this.handleError(error, 'Unable to schedule announcement.')
    });
  }

  archiveAnnouncement(id: number): void {
    this.withLocalLoader(() => this.api.archiveAnnouncement(id)).subscribe({
      next: announcement => this.applyAnnouncement(announcement, 'Announcement archived.'),
      error: error => this.handleError(error, 'Unable to archive announcement.')
    });
  }

  pinAnnouncement(id: number): void {
    this.withLocalLoader(() => this.api.pinAnnouncement(id)).subscribe({
      next: announcement => this.applyAnnouncement(announcement, 'Announcement pinned.'),
      error: error => this.handleError(error, 'Unable to pin announcement.')
    });
  }

  unpinAnnouncement(id: number): void {
    this.withLocalLoader(() => this.api.unpinAnnouncement(id)).subscribe({
      next: announcement => this.applyAnnouncement(announcement, 'Announcement unpinned.'),
      error: error => this.handleError(error, 'Unable to unpin announcement.')
    });
  }

  loadStats(): void {
    const filters = this.state.snapshot.filters;
    this.withLocalLoader(() => this.api.getStats(filters)).subscribe({
      next: stats => this.state.setStats(stats),
      error: error => this.handleError(error, 'Unable to load announcement statistics.')
    });
  }

  setFilters(filters: Partial<AnnouncementFilters>): void {
    this.state.setFilters({
      ...this.state.snapshot.filters,
      ...filters
    });
  }

  clearFilters(): void {
    this.state.setFilters(EMPTY_ANNOUNCEMENT_FILTERS);
  }

  selectAnnouncement(announcement: Announcement | null): void {
    this.state.setSelectedAnnouncement(announcement);
  }

  private applyAnnouncement(announcement: Announcement, message?: string): void {
    this.state.upsertAnnouncement(announcement);
    this.state.setStats(this.buildStats(this.state.snapshot.announcements));
    if (message) {
      this.toastr.success(message);
    }
  }

  private withLocalLoader<T>(requestFactory: () => Observable<T>): Observable<T> {
    return defer(() => {
      this.pendingRequestsSubject.next(this.pendingRequestsSubject.value + 1);
      this.state.setLocalLoading(true);
      return requestFactory().pipe(
        finalize(() => {
          this.pendingRequestsSubject.next(Math.max(0, this.pendingRequestsSubject.value - 1));
          if (this.pendingRequestsSubject.value === 0) {
            this.state.setLocalLoading(false);
          }
        })
      );
    });
  }

  private filterAnnouncements(announcements: Announcement[], filters: AnnouncementFilters): Announcement[] {
    const search = filters.search.trim().toLowerCase();

    return announcements.filter(announcement => {
      const matchesSearch = !search || [
        announcement.title,
        announcement.summary,
        announcement.content,
        announcement.authorName,
        announcement.createdBy
      ].some(value => value?.toLowerCase().includes(search));
      const matchesType = !filters.type || announcement.type === filters.type;
      const matchesPriority = !filters.priority || announcement.priority === filters.priority;
      const matchesStatus = !filters.status || announcement.status === filters.status;
      const matchesPinned = filters.pinned === null || announcement.pinned === filters.pinned;
      const date = announcement.publishedAt ?? announcement.scheduledAt ?? announcement.createdAt ?? '';
      const matchesFromDate = !filters.fromDate || date >= filters.fromDate;
      const matchesToDate = !filters.toDate || date <= filters.toDate;

      return matchesSearch
        && matchesType
        && matchesPriority
        && matchesStatus
        && matchesPinned
        && matchesFromDate
        && matchesToDate;
    });
  }

  private getFeaturedAnnouncements(announcements: Announcement[]): Announcement[] {
    const published = announcements.filter(announcement => announcement.status === 'PUBLISHED');
    const candidates = published.length ? published : announcements;
    const featured = candidates
      .filter(announcement => announcement.pinned || this.isFeaturedAnnouncement(announcement))
      .sort(this.compareFeaturedAnnouncements);

    return (featured.length ? featured : candidates.sort(this.compareRecentAnnouncements)).slice(0, 5);
  }

  private compareFeaturedAnnouncements = (left: Announcement, right: Announcement): number => {
    if (left.pinned !== right.pinned) return left.pinned ? -1 : 1;
    const priorityDelta = this.priorityRank(right.priority) - this.priorityRank(left.priority);
    if (priorityDelta !== 0) return priorityDelta;
    return this.compareRecentAnnouncements(left, right);
  };

  private compareRecentAnnouncements = (left: Announcement, right: Announcement): number => {
    return this.dateValue(right) - this.dateValue(left);
  };

  private priorityRank(priority: AnnouncementPriority): number {
    const ranks: Record<AnnouncementPriority, number> = {
      LOW: 1,
      NORMAL: 2,
      HIGH: 3,
      CRITICAL: 4
    };
    return ranks[priority];
  }

  private isHighPriority(priority: AnnouncementPriority): boolean {
    return ['HIGH', 'CRITICAL'].includes(priority);
  }

  private isFeaturedAnnouncement(announcement: Announcement): boolean {
    return announcement.type === 'URGENT' || this.isHighPriority(announcement.priority);
  }

  private dateValue(announcement: Announcement): number {
    return new Date(
      announcement.publishedAt
      ?? announcement.scheduledAt
      ?? announcement.createdAt
      ?? 0
    ).getTime();
  }

  private syncCurrentAnnouncement(announcements: Announcement[]): void {
    const currentId = this.state.snapshot.currentAnnouncement?.id;
    const currentAnnouncement = currentId ? announcements.find(item => item.id === currentId) : null;
    this.state.setCurrentAnnouncement(currentAnnouncement ?? announcements[0] ?? null);
  }

  private buildStats(announcements: Announcement[]): AnnouncementStats {
    if (announcements.length === 0) return EMPTY_ANNOUNCEMENT_STATS;

    return {
      totalAnnouncements: announcements.length,
      draftCount: announcements.filter(announcement => announcement.status === 'DRAFT').length,
      scheduledCount: announcements.filter(announcement => announcement.status === 'SCHEDULED').length,
      publishedCount: announcements.filter(announcement => announcement.status === 'PUBLISHED').length,
      archivedCount: announcements.filter(announcement => announcement.status === 'ARCHIVED').length,
      pinnedCount: announcements.filter(announcement => announcement.pinned).length,
      urgentCount: announcements.filter(announcement => this.isFeaturedAnnouncement(announcement)).length
    };
  }

  private normalizePayload(
    payload: CreateAnnouncementPayload | UpdateAnnouncementPayload | Record<string, unknown>
  ): Record<string, unknown> {
    const raw = payload as Record<string, unknown>;
    const {attachmentFiles, ...jsonPayload} = raw;

    return {
      ...jsonPayload,
      audienceType: 'ALL',
      audienceId: null,
      scheduledAt: this.toApiDate(raw['scheduledAt']),
      expiresAt: this.toApiDate(raw['expiresAt']),
      attachmentUrl: this.emptyToNull(raw['attachmentUrl']),
      externalLink: this.emptyToNull(raw['externalLink'])
    };
  }

  private extractAttachmentFiles(payload: unknown): File[] {
    const files = (payload as { attachmentFiles?: File[] }).attachmentFiles;
    return Array.isArray(files) ? files : [];
  }

  private uploadAttachmentsIfNeeded(announcement: Announcement, files: File[]): Observable<Announcement> {
    if (!files.length) {
      return defer(() => [announcement]);
    }
    return this.api.uploadAttachments(announcement.id, files);
  }

  private toApiDate(value: unknown): string | null {
    if (!value) return null;
    const date = new Date(value as string);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  private emptyToNull(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  private handleError(error: unknown, fallback: string): void {
    if (error instanceof HttpErrorResponse && typeof error.error === 'string') {
      this.toastr.error(error.error);
      return;
    }
    this.toastr.error(fallback);
  }
}
