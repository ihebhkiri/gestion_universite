import {HttpClient, HttpContext, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../../../environments/environment';
import {SKIP_GLOBAL_LOADER} from '../../../../core/constant/loader-context';
import {
  Announcement,
  AnnouncementFilters,
  AnnouncementStats,
  CreateAnnouncementPayload,
  ScheduleAnnouncementPayload,
  UpdateAnnouncementPayload
} from '../models/announcement-management.model';

@Injectable({
  providedIn: 'root'
})
export class AnnouncementApiService {
  private readonly apiUrl = `${environment.apiUrl}announcements`;
  private readonly localLoaderContext = new HttpContext().set(SKIP_GLOBAL_LOADER, true);

  constructor(private readonly http: HttpClient) {}

  getAnnouncements(filters?: Partial<AnnouncementFilters>): Observable<Announcement[]> {
    return this.http.get<Announcement[]>(this.apiUrl, {
      params: this.buildFilterParams(filters),
      context: this.localLoaderContext
    });
  }

  getAnnouncement(id: number): Observable<Announcement> {
    return this.http.get<Announcement>(`${this.apiUrl}/${id}`, {
      context: this.localLoaderContext
    });
  }

  createAnnouncement(payload: CreateAnnouncementPayload): Observable<Announcement> {
    return this.http.post<Announcement>(this.apiUrl, payload, {
      context: this.localLoaderContext
    });
  }

  updateAnnouncement(id: number, payload: UpdateAnnouncementPayload): Observable<Announcement> {
    return this.http.put<Announcement>(`${this.apiUrl}/${id}`, payload, {
      context: this.localLoaderContext
    });
  }

  publishAnnouncement(id: number): Observable<Announcement> {
    return this.http.post<Announcement>(`${this.apiUrl}/${id}/publish`, {}, {
      context: this.localLoaderContext
    });
  }

  scheduleAnnouncement(id: number, payload: ScheduleAnnouncementPayload): Observable<Announcement> {
    return this.http.post<Announcement>(`${this.apiUrl}/${id}/schedule`, payload, {
      context: this.localLoaderContext
    });
  }

  archiveAnnouncement(id: number): Observable<Announcement> {
    return this.http.post<Announcement>(`${this.apiUrl}/${id}/archive`, {}, {
      context: this.localLoaderContext
    });
  }

  pinAnnouncement(id: number): Observable<Announcement> {
    return this.http.post<Announcement>(`${this.apiUrl}/${id}/pin`, {}, {
      context: this.localLoaderContext
    });
  }

  unpinAnnouncement(id: number): Observable<Announcement> {
    return this.http.post<Announcement>(`${this.apiUrl}/${id}/unpin`, {}, {
      context: this.localLoaderContext
    });
  }

  uploadAttachments(id: number, files: File[]): Observable<Announcement> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return this.http.post<Announcement>(`${this.apiUrl}/${id}/attachments`, formData, {
      context: this.localLoaderContext
    });
  }

  getStats(filters?: Partial<AnnouncementFilters>): Observable<AnnouncementStats> {
    return this.http.get<AnnouncementStats>(`${this.apiUrl}/stats`, {
      params: this.buildFilterParams(filters),
      context: this.localLoaderContext
    });
  }

  private buildFilterParams(filters?: Partial<AnnouncementFilters>): HttpParams {
    let params = new HttpParams();
    if (!filters) return params;

    Object.entries(filters).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') return;
      params = params.set(key, value);
    });

    return params;
  }
}
