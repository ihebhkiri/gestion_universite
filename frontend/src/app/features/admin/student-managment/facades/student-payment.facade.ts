import {Injectable, inject, signal} from '@angular/core';
import {HttpResponse} from '@angular/common/http';
import {forkJoin} from 'rxjs';
import {finalize} from 'rxjs/operators';
import {StudentPaymentHistory, StudentPaymentSummary} from '../models/student-payment.model';
import {StudentPaymentService} from '../services/student-payment.service';

@Injectable({
  providedIn: 'root'
})
export class StudentPaymentFacade {
  private readonly paymentService = inject(StudentPaymentService);

  private readonly _summary = signal<StudentPaymentSummary | null>(null);
  private readonly _history = signal<StudentPaymentHistory[]>([]);
  private readonly _loading = signal(false);
  private readonly _paymentLoading = signal(false);
  private readonly _error = signal<string | null>(null);
  private activeStudentId: number | null = null;

  readonly summary = this._summary.asReadonly();
  readonly history = this._history.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly paymentLoading = this._paymentLoading.asReadonly();
  readonly error = this._error.asReadonly();

  loadPaymentData(studentId: number): void {
    this.activeStudentId = studentId;
    this._loading.set(true);
    this._error.set(null);

    forkJoin({
      summary: this.paymentService.getPaymentSummary(studentId),
      history: this.paymentService.getPaymentHistory(studentId)
    }).pipe(
      finalize(() => {
        if (this.activeStudentId === studentId) {
          this._loading.set(false);
        }
      })
    ).subscribe({
      next: ({summary, history}) => {
        if (this.activeStudentId !== studentId) return;
        this._summary.set(summary);
        this._history.set(history);
      },
      error: () => {
        if (this.activeStudentId !== studentId) return;
        this._summary.set(null);
        this._history.set([]);
        this._error.set('Impossible de charger les données de paiement.');
      }
    });
  }

  registerMonthlyPayment(studentId: number): void {
    this._paymentLoading.set(true);
    this._error.set(null);

    this.paymentService.registerMonthlyPaymentAndDownloadReceipt(studentId).pipe(
      finalize(() => this._paymentLoading.set(false))
    ).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) {
          this._error.set('Le reçu de paiement est vide.');
          return;
        }

        this.downloadPdf(blob, this.extractFilename(response) ?? `recu-paiement-${studentId}.pdf`);
        this.loadPaymentData(studentId);
      },
      error: () => {
        this._error.set('Impossible d’enregistrer le paiement.');
      }
    });
  }

  clear(): void {
    this.activeStudentId = null;
    this._summary.set(null);
    this._history.set([]);
    this._loading.set(false);
    this._paymentLoading.set(false);
    this._error.set(null);
  }

  private downloadPdf(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = url;
    anchor.download = filename;
    anchor.click();

    window.URL.revokeObjectURL(url);
  }

  private extractFilename(response: HttpResponse<Blob>): string | null {
    const disposition = response.headers.get('Content-Disposition');
    const match = disposition?.match(/filename="?([^"]+)"?/);
    return match?.[1] ?? null;
  }
}
