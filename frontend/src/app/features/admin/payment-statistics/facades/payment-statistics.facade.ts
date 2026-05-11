import {Injectable, computed, inject, signal} from '@angular/core';
import {finalize} from 'rxjs';
import {PaymentStatisticsResponse} from '../models/payment-statistics.model';
import {PaymentStatisticsService} from '../services/payment-statistics.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentStatisticsFacade {
  private readonly paymentStatisticsService = inject(PaymentStatisticsService);

  private readonly _statistics = signal<PaymentStatisticsResponse | null>(null);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly statistics = this._statistics.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly summary = computed(() => this._statistics()?.summary ?? null);
  readonly paidVsRemaining = computed(() => this._statistics()?.paidVsRemaining ?? []);
  readonly paymentsBySpeciality = computed(() => this._statistics()?.paymentsBySpeciality ?? []);
  readonly paymentEvolution = computed(() => this._statistics()?.paymentEvolution ?? []);
  readonly hasData = computed(() => {
    const statistics = this._statistics();
    const summaryTotal = statistics?.summary?.totalAmount ?? 0;

    return Boolean(
      summaryTotal > 0 ||
      statistics?.paidVsRemaining.length ||
      statistics?.paymentsBySpeciality.length ||
      statistics?.paymentEvolution.length
    );
  });

  loadStatistics(): void {
    this._loading.set(true);
    this._error.set(null);

    this.paymentStatisticsService.getStatistics().pipe(
      finalize(() => this._loading.set(false))
    ).subscribe({
      next: statistics => this._statistics.set(statistics),
      error: () => {
        this._statistics.set(null);
        this._error.set('Impossible de charger les statistiques de paiement.');
      }
    });
  }
}
