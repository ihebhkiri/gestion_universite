export type AnnouncementStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED' | string;
export type AnnouncementPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL' | string;
export type AnnouncementType = 'INFO' | 'WARNING' | 'URGENT' | 'EVENT' | 'DEADLINE' | string;
export type AnnouncementAudience = 'ALL' | 'PROGRAM' | 'CLASS' | 'GROUP' | 'COURSE' | 'STUDENT' | 'TEACHER' | string;

export interface AnnouncementLike {
  id?: number | string;
  title?: string;
  content?: string;
  body?: string;
  type?: AnnouncementType;
  priority?: AnnouncementPriority;
  status?: AnnouncementStatus;
  audience?: AnnouncementAudience;
  audienceType?: AnnouncementAudience;
  audienceId?: number | string | null;
  targetIds?: Array<number | string>;
  audienceIds?: Array<number | string>;
  scheduledAt?: string | Date | null;
  expiresAt?: string | Date | null;
  publishedAt?: string | Date | null;
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;
  externalLink?: string;
  attachmentUrl?: string;
  attachmentFiles?: File[];
  pinned?: boolean;
  urgent?: boolean;
  views?: number;
  viewCount?: number;
  authorName?: string;
  createdBy?: string;
}

export interface AnnouncementFiltersValue {
  search: string;
  type: string;
  priority: string;
  status: string;
}

export interface AnnouncementStatsLike {
  published?: number;
  publishedCount?: number;
  scheduled?: number;
  scheduledCount?: number;
  urgent?: number;
  urgentCount?: number;
  archived?: number;
  archivedCount?: number;
  totalViews?: number;
  viewsTotal?: number;
  nextPublication?: string | Date | null;
  nextScheduledAt?: string | Date | null;
}

export type AnnouncementEditorPayload = Omit<AnnouncementLike, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: number | string | null;
};
