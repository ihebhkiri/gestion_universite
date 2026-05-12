export interface StudentKpiCard {
  label: string;
  value: string;
  helper?: string;
  trend?: string;
  icon?: string;
  progress?: number;
  variant?: 'default' | 'accent' | 'illustrated';
}

export interface StudentAgendaItem {
  startTime: string;
  duration: string;
  title: string;
  meta: string;
  state: 'past' | 'current' | 'upcoming';
}

export interface StudentPerformanceItem {
  initials: string;
  title: string;
  submittedAt: string;
  score: string;
  remark: string;
  tone: 'success' | 'neutral';
}

export interface StudentExamItem {
  month: string;
  day: string;
  title: string;
  meta: string;
}

export interface StudentTaskItem {
  icon: string;
  title: string;
  description: string;
  tone: 'danger' | 'primary' | 'muted';
}

export interface StudentAnnouncement {
  category: string;
  message: string;
}

export interface StudentFinanceTransaction {
  id: string;
  description: string;
  date: string;
  amount: string;
  status: string;
}

export interface StudentPreviewItem {
  title: string;
  subtitle?: string;
  meta?: string;
  status?: string;
  amount?: string;
  date?: string;
}

export interface StudentPreviewCard {
  title: string;
  icon: string;
  route: string;
  emptyStateText?: string;
  items: StudentPreviewItem[];
}
