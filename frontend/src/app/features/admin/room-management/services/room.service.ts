import {HttpClient, HttpContext, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {environment} from '../../../../../environments/environment';
import {SKIP_GLOBAL_LOADER} from '../../../../core/constant/loader-context';
import {PageableResponse, RoomFilters, RoomRequest, RoomResponse} from '../models/room.model';

@Injectable({
  providedIn: 'root'
})
export class RoomService {
  private readonly apiUrl = `${environment.apiUrl}admin/rooms`;
  private readonly localLoaderContext = new HttpContext().set(SKIP_GLOBAL_LOADER, true);

  constructor(private readonly http: HttpClient) {}

  getRooms(filters: RoomFilters, page: number, size: number): Observable<PageableResponse<RoomResponse>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', 'name,asc');

    if (filters.search) params = params.set('search', filters.search);
    if (filters.building) params = params.set('building', filters.building);
    if (filters.location) params = params.set('location', filters.location);
    if (filters.type) params = params.set('type', filters.type);

    return this.http.get<PageableResponse<RoomResponse>>(this.apiUrl, {
      params,
      context: this.localLoaderContext
    });
  }

  getRoom(id: number): Observable<RoomResponse> {
    return this.http.get<RoomResponse>(`${this.apiUrl}/${id}`, {context: this.localLoaderContext});
  }

  create(request: RoomRequest): Observable<RoomResponse> {
    return this.http.post<RoomResponse>(this.apiUrl, request, {context: this.localLoaderContext});
  }

  update(id: number, request: RoomRequest): Observable<RoomResponse> {
    return this.http.put<RoomResponse>(`${this.apiUrl}/${id}`, request, {context: this.localLoaderContext});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {context: this.localLoaderContext});
  }
}
