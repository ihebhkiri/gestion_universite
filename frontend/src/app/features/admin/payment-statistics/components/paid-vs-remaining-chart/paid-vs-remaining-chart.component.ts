import {DecimalPipe} from '@angular/common';
import {Component, computed, input} from '@angular/core';
import {PaidVsRemainingStat} from '../../models/payment-statistics.model';

@Component({
  selector: 'app-paid-vs-remaining-chart',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './paid-vs-remaining-chart.component.html',
  styleUrl: './paid-vs-remaining-chart.component.scss'
})
export class PaidVsRemainingChartComponent {
  readonly data = input<PaidVsRemainingStat[]>([]);
  readonly currency = input('TND');

  readonly totalPaid = computed(() => this.data().reduce((sum, item) => sum + item.paidAmount, 0));
  readonly totalRemaining = computed(() => this.data().reduce((sum, item) => sum + item.remainingAmount, 0));
  readonly total = computed(() => this.totalPaid() + this.totalRemaining());
  readonly paidPercent = computed(() => this.total() ? (this.totalPaid() / this.total()) * 100 : 0);
  readonly remainingPercent = computed(() => 100 - this.paidPercent());
}
