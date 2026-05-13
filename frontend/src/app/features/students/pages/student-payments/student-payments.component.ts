import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StudentHeaderComponent } from '../../../../shared/students/student-header/student-header.component';
import { StudentPage } from '../../models/student-course.model';
import { StudentPayment, StudentPaymentSummary } from '../../models/student-payment.model';
import { StudentPaymentsService } from '../../services/student-payments.service';

const EMPTY_PAGE: StudentPage<StudentPayment> = {
  content: [],
  totalPages: 0,
  totalElements: 0,
  size: 10,
  number: 0,
  first: true,
  last: true,
  numberOfElements: 0,
  empty: true,
};

@Component({
  selector: 'app-student-payments',
  standalone: true,
  imports: [FormsModule, StudentHeaderComponent],
  templateUrl: './student-payments.component.html',
  styleUrl: './student-payments.component.scss',
})
export class StudentPaymentsComponent implements OnInit {
  private readonly studentPaymentsService = inject(StudentPaymentsService);
  private readonly destroyRef = inject(DestroyRef);

  page: StudentPage<StudentPayment> = EMPTY_PAGE;
  summary: StudentPaymentSummary | null = null;
  isLoading = true;
  isSummaryLoading = true;
  errorMessage = '';

  readonly pageSize = 10;
  status = '';
  fromDate = '';
  toDate = '';

  ngOnInit(): void {
    this.loadSummary();
    this.loadPayments(0);
  }

  get payments(): StudentPayment[] {
    return this.page.content;
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.page.totalPages }, (_, index) => index)
      .filter((pageNumber) => pageNumber === 0
        || pageNumber === this.page.totalPages - 1
        || Math.abs(pageNumber - this.page.number) <= 1);
  }

  loadSummary(): void {
    this.isSummaryLoading = true;

    this.studentPaymentsService.getPaymentSummary()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (summary) => {
          this.summary = summary;
          this.isSummaryLoading = false;
        },
        error: () => {
          this.summary = null;
          this.isSummaryLoading = false;
        },
      });
  }

  loadPayments(page = this.page.number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.studentPaymentsService.getMyPayments({
      page,
      size: this.pageSize,
      status: this.status,
      fromDate: this.fromDate,
      toDate: this.toDate,
      sort: 'paymentDate,desc',
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (pageResponse) => {
          this.page = pageResponse;
          this.isLoading = false;
        },
        error: () => {
          this.page = { ...EMPTY_PAGE };
          this.errorMessage = 'Impossible de charger les paiements.';
          this.isLoading = false;
        },
      });
  }

  applyFilters(): void {
    this.loadPayments(0);
  }

  clearFilters(): void {
    this.status = '';
    this.fromDate = '';
    this.toDate = '';
    this.loadPayments(0);
  }

  retry(): void {
    this.loadSummary();
    this.loadPayments();
  }

  goToPage(page: number): void {
    if (page < 0 || page >= this.page.totalPages || page === this.page.number) {
      return;
    }

    this.loadPayments(page);
  }

  trackByPayment(_: number, payment: StudentPayment): number {
    return payment.id;
  }

  money(value: number | null | undefined, currency = 'TND'): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return '-';
    }

    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'TND',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  dateLabel(value: string | null | undefined): string {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  displayText(value: string | null | undefined): string {
    return value?.trim() || '-';
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      PAID: 'Paid',
      PARTIAL: 'Partial',
      PENDING: 'Pending',
      OVERDUE: 'Overdue',
    };
    return labels[status] ?? status;
  }

  statusClass(status: string): string {
    const normalized = status?.toUpperCase();
    if (normalized === 'PAID') return 'status-badge--paid';
    if (normalized === 'PARTIAL') return 'status-badge--partial';
    if (normalized === 'OVERDUE') return 'status-badge--overdue';
    return 'status-badge--pending';
  }
}
