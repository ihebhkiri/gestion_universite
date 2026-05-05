import {Injectable} from '@angular/core';
import {BehaviorSubject, distinctUntilChanged, map} from 'rxjs';
import {
  Announcement,
  AnnouncementFilters,
  AnnouncementManagementState,
  AnnouncementStats,
  EMPTY_ANNOUNCEMENT_FILTERS,
  EMPTY_ANNOUNCEMENT_STATS
} from '../models/announcement-management.model';

const INITIAL_STATE: AnnouncementManagementState = {
  announcements: [],
  currentAnnouncement: null,
  stats: EMPTY_ANNOUNCEMENT_STATS,
  filters: EMPTY_ANNOUNCEMENT_FILTERS,
  selectedAnnouncement: null,
  localLoading: false
};

@Injectable()
export class AnnouncementStateService {
  private readonly stateSubject = new BehaviorSubject<AnnouncementManagementState>(INITIAL_STATE);

  readonly state$ = this.stateSubject.asObservable();
  readonly announcements$ = this.select(state => state.announcements);
  readonly currentAnnouncement$ = this.select(state => state.currentAnnouncement);
  readonly stats$ = this.select(state => state.stats);
  readonly filters$ = this.select(state => state.filters);
  readonly selectedAnnouncement$ = this.select(state => state.selectedAnnouncement);
  readonly localLoading$ = this.select(state => state.localLoading);

  setAnnouncements(announcements: Announcement[]): void {
    this.patch({announcements});
  }

  setCurrentAnnouncement(currentAnnouncement: Announcement | null): void {
    this.patch({currentAnnouncement});
  }

  setStats(stats: AnnouncementStats): void {
    this.patch({stats});
  }

  setFilters(filters: AnnouncementFilters): void {
    this.patch({filters});
  }

  setSelectedAnnouncement(selectedAnnouncement: Announcement | null): void {
    this.patch({selectedAnnouncement});
  }

  setLocalLoading(localLoading: boolean): void {
    this.patch({localLoading});
  }

  upsertAnnouncement(announcement: Announcement): void {
    const announcements = this.stateSubject.value.announcements;
    const exists = announcements.some(item => item.id === announcement.id);
    this.patch({
      announcements: exists
        ? announcements.map(item => item.id === announcement.id ? announcement : item)
        : [announcement, ...announcements],
      currentAnnouncement: announcement,
      selectedAnnouncement: announcement
    });
  }

  get snapshot(): AnnouncementManagementState {
    return this.stateSubject.value;
  }

  private patch(partial: Partial<AnnouncementManagementState>): void {
    this.stateSubject.next({...this.stateSubject.value, ...partial});
  }

  private select<T>(selector: (state: AnnouncementManagementState) => T) {
    return this.state$.pipe(
      map(selector),
      distinctUntilChanged()
    );
  }
}
