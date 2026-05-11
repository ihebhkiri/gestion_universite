import {CommonModule} from '@angular/common';
import {Component, OnInit, inject} from '@angular/core';
import {HeaderComponent} from '../../../../../shared/components/admin/header/header.component';
import {SidebarComponent} from '../../../../../shared/components/admin/sidebar/sidebar.component';
import {PaidVsRemainingChartComponent} from '../../components/paid-vs-remaining-chart/paid-vs-remaining-chart.component';
import {PaymentMonthlyLineChartComponent} from '../../components/payment-monthly-line-chart/payment-monthly-line-chart.component';
import {PaymentSummaryCardsComponent} from '../../components/payment-summary-cards/payment-summary-cards.component';
import {PaymentsBySpecialityChartComponent} from '../../components/payments-by-speciality-chart/payments-by-speciality-chart.component';
import {PaymentStatisticsFacade} from '../../facades/payment-statistics.facade';

@Component({
  selector: 'app-payment-stats-page',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    HeaderComponent,
    PaymentSummaryCardsComponent,
    PaidVsRemainingChartComponent,
    PaymentsBySpecialityChartComponent,
    PaymentMonthlyLineChartComponent
  ],
  templateUrl: './payment-stats-page.component.html',
  styleUrl: './payment-stats-page.component.scss'
})
export class PaymentStatsPageComponent implements OnInit {
  readonly paymentStatsFacade = inject(PaymentStatisticsFacade);

  ngOnInit(): void {
    this.paymentStatsFacade.loadStatistics();
  }
}
