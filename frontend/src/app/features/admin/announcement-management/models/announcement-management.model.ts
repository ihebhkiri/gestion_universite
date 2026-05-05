export type AnnouncementType = 'INFO' | 'WARNING' | 'URGENT' | 'EVENT' | 'DEADLINE';
export type AnnouncementPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
export type AnnouncementStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'ARCHIVED';
export type AnnouncementAudienceType = 'ALL' | 'PROGRAM' | 'CLASS' | 'GROUP' | 'COURSE' | 'STUDENT' | 'TEACHER';

export interface Announcement {
  id: number;
  title: string;
  content: string;
  summary: string | null;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  audienceType: AnnouncementAudienceType;
  audienceId: number | null;
  authorId: number | null;
  authorName: string | null;
  createdBy?: string | null;
  pinned: boolean;
  viewCount: number;
  publishedAt: string | null;
  scheduledAt: string | null;
  archivedAt: string | null;
  expiresAt: string | null;
  attachmentUrl?: string | null;
  externalLink?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AnnouncementStats {
  totalAnnouncements: number;
  draftCount: number;
  scheduledCount: number;
  publishedCount: number;
  archivedCount: number;
  pinnedCount: number;
  urgentCount: number;
}

export interface AnnouncementFilters {
  search: string;
  type: AnnouncementType | '';
  priority: AnnouncementPriority | '';
  status: AnnouncementStatus | '';
  audienceType: AnnouncementAudienceType | '';
  pinned: boolean | null;
  fromDate: string;
  toDate: string;
}

export interface CreateAnnouncementPayload {
  title: string;
  content: string;
  summary?: string | null;
  type: AnnouncementType;
  priority: AnnouncementPriority;
  audienceType: AnnouncementAudienceType;
  audienceId?: number | null;
  pinned?: boolean;
  scheduledAt?: string | null;
  expiresAt?: string | null;
  attachmentUrl?: string | null;
  attachmentFiles?: File[];
  externalLink?: string | null;
}

export interface UpdateAnnouncementPayload {
  title?: string;
  content?: string;
  summary?: string | null;
  type?: AnnouncementType;
  priority?: AnnouncementPriority;
  audienceType?: AnnouncementAudienceType;
  audienceId?: number | null;
  pinned?: boolean;
  scheduledAt?: string | null;
  expiresAt?: string | null;
  attachmentUrl?: string | null;
  attachmentFiles?: File[];
  externalLink?: string | null;
}

export interface ScheduleAnnouncementPayload {
  scheduledAt: string;
  expiresAt?: string | null;
}

export interface AnnouncementManagementState {
  announcements: Announcement[];
  currentAnnouncement: Announcement | null;
  stats: AnnouncementStats;
  filters: AnnouncementFilters;
  selectedAnnouncement: Announcement | null;
  localLoading: boolean;
}

export const EMPTY_ANNOUNCEMENT_FILTERS: AnnouncementFilters = {
  search: '',
  type: '',
  priority: '',
  status: '',
  audienceType: '',
  pinned: null,
  fromDate: '',
  toDate: ''
};

export const EMPTY_ANNOUNCEMENT_STATS: AnnouncementStats = {
  totalAnnouncements: 0,
  draftCount: 0,
  scheduledCount: 0,
  publishedCount: 0,
  archivedCount: 0,
  pinnedCount: 0,
  urgentCount: 0
};

export const ANNOUNCEMENT_TYPE_OPTIONS: {value: AnnouncementType; label: string}[] = [
  {value: 'INFO', label: 'Info'},
  {value: 'WARNING', label: 'Warning'},
  {value: 'URGENT', label: 'Urgent'},
  {value: 'EVENT', label: 'Event'},
  {value: 'DEADLINE', label: 'Deadline'}
];

export const ANNOUNCEMENT_PRIORITY_OPTIONS: {value: AnnouncementPriority; label: string}[] = [
  {value: 'LOW', label: 'Low'},
  {value: 'NORMAL', label: 'Normal'},
  {value: 'HIGH', label: 'High'},
  {value: 'CRITICAL', label: 'Critical'}
];

export const ANNOUNCEMENT_STATUS_OPTIONS: {value: AnnouncementStatus; label: string}[] = [
  {value: 'DRAFT', label: 'Draft'},
  {value: 'SCHEDULED', label: 'Scheduled'},
  {value: 'PUBLISHED', label: 'Published'},
  {value: 'ARCHIVED', label: 'Archived'}
];
