import {HttpErrorResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, finalize} from 'rxjs';
import {AttendanceAnalyticsFilters} from '../models/attendance-analytics.model';
import {AttendanceAiReportService} from '../services/attendance-ai-report.service';

@Injectable()
export class AttendanceAiReportFacade {
  private static readonly FILE_NAME = 'rapport-presence-ia.pdf';

  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<string | null>(null);

  readonly loading$ = this.loadingSubject.asObservable();
  readonly error$ = this.errorSubject.asObservable();

  constructor(private readonly reportService: AttendanceAiReportService) {}

  generateAndDownloadPdf(filters: AttendanceAnalyticsFilters): void {
    if (this.loadingSubject.value) {
      return;
    }

    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.reportService.generatePdf(filters).pipe(
      finalize(() => this.loadingSubject.next(false))
    ).subscribe({
      next: pdf => this.downloadPdf(pdf),
      error: error => this.errorSubject.next(this.errorMessage(error))
    });
  }

  private downloadPdf(pdf: Blob): void {
    const url = window.URL.createObjectURL(pdf);
    const anchor = document.createElement('a');

    try {
      anchor.href = url;
      anchor.download = AttendanceAiReportFacade.FILE_NAME;
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
    } finally {
      anchor.remove();
      window.URL.revokeObjectURL(url);
    }
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 403) {
      return 'Vous n\'avez pas les droits pour générer ce rapport.';
    }

    return 'Impossible de générer le rapport IA pour le moment.';
  }
}
