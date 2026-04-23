import { Component, Input } from '@angular/core';
import { DashboardMetricCard } from '../../../../models/dashboard.model';

@Component({
  selector: 'app-kpi-cards',
  standalone: true,
  templateUrl: './kpi-cards.component.html',
  styleUrl: './kpi-cards.component.scss',
})
export class KpiCardsComponent {
  @Input({ required: true }) cards: DashboardMetricCard[] = [];
}
