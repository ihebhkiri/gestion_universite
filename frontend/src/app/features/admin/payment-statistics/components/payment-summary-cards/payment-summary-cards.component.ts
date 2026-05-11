import {DecimalPipe} from '@angular/common';
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
  imports: [DecimalPipe],
  templateUrl: './payment-summary-cards.component.html',
  styleUrl: './payment-summary-cards.component.scss'
})
export class PaymentSummaryCardsComponent {
  readonly summary = input<PaymentSummary | null>(null);

  get cards(): PaymentSummaryCard[] {
    const summary = this.summary();
    return [
      {
        label: 'Total amount',
        value: summary?.totalAmount ?? 0,
        hint: 'Expected tuition fees',
        icon: 'account_balance_wallet',
        format: 'currency'
      },
      {
        label: 'Paid amount',
        value: summary?.totalPaidAmount ?? 0,
        hint: `${summary?.paidPercentage ?? 0}% collected`,
        icon: 'paid',
        format: 'currency'
      },
      {
        label: 'Remaining amount',
        value: summary?.totalRemainingAmount ?? 0,
        hint: `${summary?.remainingPercentage ?? 0}% to collect`,
        icon: 'pending_actions',
        format: 'currency'
      },
      {
        label: 'Payment rate',
        value: summary?.paidPercentage ?? 0,
        hint: 'Share of received payments',
        icon: 'donut_large',
        format: 'percent'
      }
    ];
  }

  get currency(): string {
    return this.summary()?.currency || 'TND';
  }
}
