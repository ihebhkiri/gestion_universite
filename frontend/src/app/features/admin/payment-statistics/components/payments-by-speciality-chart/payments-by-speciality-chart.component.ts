import {DecimalPipe} from '@angular/common';
import {Component, input} from '@angular/core';
import {PaymentBySpecialityStat} from '../../models/payment-statistics.model';

@Component({
  selector: 'app-payments-by-speciality-chart',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './payments-by-speciality-chart.component.html',
  styleUrl: './payments-by-speciality-chart.component.scss'
})
export class PaymentsBySpecialityChartComponent {
  readonly data = input<PaymentBySpecialityStat[]>([]);
  readonly currency = input('TND');

  paidPercent(item: PaymentBySpecialityStat): number {
    return item.totalAmount ? (item.paidAmount / item.totalAmount) * 100 : 0;
  }

  remainingPercent(item: PaymentBySpecialityStat): number {
    return item.totalAmount ? (item.remainingAmount / item.totalAmount) * 100 : 0;
  }
}
