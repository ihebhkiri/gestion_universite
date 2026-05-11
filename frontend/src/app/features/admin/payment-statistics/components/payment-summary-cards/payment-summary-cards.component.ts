import {CurrencyPipe, DecimalPipe} from '@angular/common';
import {Component, input} from '@angular/core';
import {PaymentSummary} from '../../models/payment-statistics.model';

interface PaymentSummaryCard {
  label: string;
  value: number;
  hint: string;
  icon: string;
  format: 'currency' | 'percent';
}

@Component({
  selector: 'app-payment-summary-cards',
  standalone: true,
  imports: [CurrencyPipe, DecimalPipe],
  templateUrl: './payment-summary-cards.component.html',
  styleUrl: './payment-summary-cards.component.scss'
})
export class PaymentSummaryCardsComponent {
  readonly summary = input<PaymentSummary | null>(null);

  get cards(): PaymentSummaryCard[] {
    const summary = this.summary();
    return [
      {
        label: 'Montant total',
        value: summary?.totalAmount ?? 0,
        hint: 'Frais attendus',
        icon: 'account_balance_wallet',
        format: 'currency'
      },
      {
        label: 'Montant payé',
        value: summary?.totalPaidAmount ?? 0,
        hint: `${summary?.paidPercentage ?? 0}% encaissé`,
        icon: 'paid',
        format: 'currency'
      },
      {
        label: 'Montant restant',
        value: summary?.totalRemainingAmount ?? 0,
        hint: `${summary?.remainingPercentage ?? 0}% à recouvrer`,
        icon: 'pending_actions',
        format: 'currency'
      },
      {
        label: 'Taux payé',
        value: summary?.paidPercentage ?? 0,
        hint: 'Part des paiements reçus',
        icon: 'donut_large',
        format: 'percent'
      }
    ];
  }

  get currency(): string {
    return this.summary()?.currency || 'TND';
  }
}
