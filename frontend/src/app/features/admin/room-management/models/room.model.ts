import {FormControl} from '@angular/forms';

export interface RoomResponse {
  id: number;
  code: string;
  name: string;
  capacity: number;
  type: string;
  building: string | null;
  location: string | null;
}

export interface RoomRequest {
  name: string;
  capacity: number;
  type: string;
  building?: string | null;
  location?: string | null;
}

export interface RoomFilters {
  search: string;
  building: string;
  location: string;
  type: string;
}

export interface RoomFilterForm {
  search: FormControl<string>;
  building: FormControl<string>;
  location: FormControl<string>;
  type: FormControl<string>;
}

export interface PageableResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
}

export const ROOM_TYPES = [
  {value: 'AMPHITHEATER', label: 'Amphitheater'},
  {value: 'CLASSROOM', label: 'Classroom'},
  {value: 'LAB', label: 'Lab'},
  {value: 'COMPUTER_LAB', label: 'Computer lab'},
  {value: 'WORKSHOP', label: 'Workshop'}
] as const;
