import {HttpErrorResponse} from '@angular/common/http';
import {inject, Injectable, OnDestroy} from '@angular/core';
import {FormBuilder} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {
  BehaviorSubject,
  Observable,
  Subject,
  debounceTime,
  defer,
  distinctUntilChanged,
  finalize,
  map,
  takeUntil
} from 'rxjs';
import {PageableResponse, ROOM_TYPES, RoomFilterForm, RoomFilters, RoomRequest, RoomResponse} from '../models/room.model';
import {RoomService} from './room.service';

const EMPTY_FILTERS: RoomFilters = {
  search: '',
  building: '',
  location: '',
  type: ''
};

const EMPTY_PAGE: PageableResponse<RoomResponse> = {
  content: [],
  totalPages: 0,
  totalElements: 0,
  size: 9,
  number: 0,
  first: true,
  last: true,
  numberOfElements: 0,
  empty: true
};

@Injectable()
export class RoomFacadeService implements OnDestroy {
  readonly roomTypes = ROOM_TYPES;

  private readonly fb = inject(FormBuilder);
  private readonly roomService = inject(RoomService);
  private readonly toastr = inject(ToastrService);

  readonly filtersForm = this.fb.group<RoomFilterForm>({
    search: this.fb.nonNullable.control(''),
    building: this.fb.nonNullable.control(''),
    location: this.fb.nonNullable.control(''),
    type: this.fb.nonNullable.control('')
  });

  private readonly destroy$ = new Subject<void>();
  private readonly roomsSubject = new BehaviorSubject<RoomResponse[]>([]);
  private readonly pageSubject = new BehaviorSubject<PageableResponse<RoomResponse>>(EMPTY_PAGE);
  private readonly filtersSubject = new BehaviorSubject<RoomFilters>(EMPTY_FILTERS);
  private readonly pageIndexSubject = new BehaviorSubject<number>(0);
  private readonly pageSizeSubject = new BehaviorSubject<number>(9);
  private readonly selectedRoomSubject = new BehaviorSubject<RoomResponse | null>(null);
  private readonly isLoadingSubject = new BehaviorSubject<boolean>(false);
  private readonly isSavingSubject = new BehaviorSubject<boolean>(false);
  private readonly isFormOpenSubject = new BehaviorSubject<boolean>(false);
  private pendingRequests = 0;

  readonly rooms$ = this.roomsSubject.asObservable();
  readonly page$ = this.pageSubject.asObservable();
  readonly totalElements$ = this.page$.pipe(map(page => page.totalElements));
  readonly totalPages$ = this.page$.pipe(map(page => page.totalPages));
  readonly pageIndex$ = this.pageIndexSubject.asObservable();
  readonly pageSize$ = this.pageSizeSubject.asObservable();
  readonly pageNumbers$ = this.totalPages$.pipe(map(total => Array.from({length: total}, (_, index) => index)));
  readonly selectedRoom$ = this.selectedRoomSubject.asObservable();
  readonly isLoading$ = this.isLoadingSubject.asObservable();
  readonly isSaving$ = this.isSavingSubject.asObservable();
  readonly isFormOpen$ = this.isFormOpenSubject.asObservable();
  readonly totalCapacity$ = this.rooms$.pipe(
    map(rooms => rooms.reduce((total, room) => total + (room.capacity ?? 0), 0))
  );

  constructor() {
    this.filtersForm.valueChanges.pipe(
      debounceTime(300),
      map(value => this.normalizeFilters(value as RoomFilters)),
      distinctUntilChanged(this.sameJson),
      takeUntil(this.destroy$)
    ).subscribe(filters => {
      this.filtersSubject.next(filters);
      this.pageIndexSubject.next(0);
      this.loadRooms();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRooms(): void {
    this.withLocalLoader(() => this.roomService.getRooms(
      this.filtersSubject.value,
      this.pageIndexSubject.value,
      this.pageSizeSubject.value
    )).subscribe({
      next: page => {
        this.pageSubject.next(page);
        this.roomsSubject.next(page.content);
      },
      error: () => this.toastr.error('Unable to load rooms.')
    });
  }

  refresh(): void {
    this.loadRooms();
  }

  resetFilters(): void {
    this.filtersForm.reset(EMPTY_FILTERS);
  }

  changePage(page: number): void {
    const totalPages = this.pageSubject.value.totalPages;
    if (page < 0 || page >= totalPages) return;
    this.pageIndexSubject.next(page);
    this.loadRooms();
  }

  previousPage(): void {
    this.changePage(this.pageIndexSubject.value - 1);
  }

  nextPage(): void {
    this.changePage(this.pageIndexSubject.value + 1);
  }

  changePageSize(size: string): void {
    this.pageIndexSubject.next(0);
    this.pageSizeSubject.next(Number(size));
    this.loadRooms();
  }

  openCreate(): void {
    this.selectedRoomSubject.next(null);
    this.isFormOpenSubject.next(true);
  }

  openEdit(room: RoomResponse): void {
    this.selectedRoomSubject.next(room);
    this.isFormOpenSubject.next(true);
  }

  closeForm(): void {
    this.isFormOpenSubject.next(false);
    this.selectedRoomSubject.next(null);
  }

  saveRoom(request: RoomRequest): void {
    const selectedRoom = this.selectedRoomSubject.value;
    this.isSavingSubject.next(true);

    const request$ = selectedRoom
      ? this.roomService.update(selectedRoom.id, request)
      : this.roomService.create(request);

    this.withLocalLoader(() => request$).pipe(
      finalize(() => this.isSavingSubject.next(false))
    ).subscribe({
      next: () => {
        this.loadRooms();
        this.toastr.success(selectedRoom ? 'Room updated.' : 'Room created.');
        this.closeForm();
      },
      error: error => this.handleSaveError(error)
    });
  }

  deleteRoom(room: RoomResponse): void {
    if (!confirm(`Delete room ${room.name}?`)) return;

    this.withLocalLoader(() => this.roomService.delete(room.id)).subscribe({
      next: () => {
        this.loadRooms();
        this.toastr.success('Room deleted.');
      },
      error: () => this.toastr.error('Unable to delete this room.')
    });
  }

  typeLabel(type: string | null | undefined): string {
    return this.roomTypes.find(item => item.value === type)?.label ?? (type || 'Room');
  }

  typeBadgeClass(type: string | null | undefined): string {
    const classes: Record<string, string> = {
      AMPHITHEATER: 'bg-primary-fixed text-on-primary-fixed',
      CLASSROOM: 'bg-secondary-container text-on-secondary-container',
      LAB: 'bg-[#ecfdf5] text-[#065f46]',
      COMPUTER_LAB: 'bg-[#eef2ff] text-[#3730a3]',
      WORKSHOP: 'bg-tertiary-fixed text-on-tertiary-fixed'
    };
    return classes[type ?? ''] ?? 'bg-surface-container-high text-on-surface-variant';
  }

  private withLocalLoader<T>(requestFactory: () => Observable<T>): Observable<T> {
    return defer(() => {
      this.incrementPendingRequests();
      return requestFactory().pipe(finalize(() => this.decrementPendingRequests()));
    });
  }

  private incrementPendingRequests(): void {
    this.pendingRequests += 1;
    this.isLoadingSubject.next(true);
  }

  private decrementPendingRequests(): void {
    this.pendingRequests = Math.max(0, this.pendingRequests - 1);
    this.isLoadingSubject.next(this.pendingRequests > 0);
  }

  private normalizeFilters(value: RoomFilters): RoomFilters {
    return {
      search: value.search?.trim() ?? '',
      building: value.building?.trim() ?? '',
      location: value.location?.trim() ?? '',
      type: value.type ?? ''
    };
  }

  private sameJson<T>(left: T, right: T): boolean {
    return JSON.stringify(left) === JSON.stringify(right);
  }

  private handleSaveError(error: unknown): void {
    if (error instanceof HttpErrorResponse && error.status === 409) {
      this.toastr.error(typeof error.error === 'string' ? error.error : 'Room already exists.');
      return;
    }
    this.toastr.error('Unable to save room.');
  }
}
