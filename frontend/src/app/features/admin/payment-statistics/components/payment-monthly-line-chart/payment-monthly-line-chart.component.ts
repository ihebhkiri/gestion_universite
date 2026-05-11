import {Component, Input, OnChanges} from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexGrid,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  NgApexchartsModule
} from 'ng-apexcharts';
import {PaymentEvolutionPoint} from '../../models/payment-statistics.model';

export type MonthlyPaymentLineChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
};

@Component({
  selector: 'app-payment-monthly-line-chart',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './payment-monthly-line-chart.component.html',
  styleUrl: './payment-monthly-line-chart.component.scss'
})
export class PaymentMonthlyLineChartComponent implements OnChanges {
  @Input() data: PaymentEvolutionPoint[] = [];

  chartOptions: MonthlyPaymentLineChartOptions = this.buildChartOptions([], []);

  ngOnChanges(): void {
    const categories = this.data.map(item => this.formatPeriod(item.period));
    const values = this.data.map(item => item.paidAmount);

    this.chartOptions = this.buildChartOptions(categories, values);
  }

  private buildChartOptions(categories: string[], values: number[]): MonthlyPaymentLineChartOptions {
    return {
      series: [
        {
          name: 'Paiements',
          data: values
        }
      ],
      chart: {
        type: 'line',
        height: 320,
        toolbar: {
          show: false
        },
        zoom: {
          enabled: false
        },
        fontFamily: 'inherit'
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      dataLabels: {
        enabled: false
      },
      xaxis: {
        categories,
        labels: {
          style: {
            colors: '#64748b'
          }
        }
      },
      yaxis: {
        labels: {
          formatter: (value: number) => `${Math.round(value)} TND`,
          style: {
            colors: '#64748b'
          }
        }
      },
      tooltip: {
        y: {
          formatter: (value: number) => `${value.toLocaleString('fr-TN')} TND`
        }
      },
      grid: {
        strokeDashArray: 4,
        borderColor: '#e5e7eb'
      }
    };
  }

  private formatPeriod(period: string): string {
    const [year, month] = period.split('-').map(Number);

    if (!year || !month) {
      return period;
    }

    return new Intl.DateTimeFormat('fr-FR', {
      month: 'short',
      year: 'numeric'
    }).format(new Date(year, month - 1, 1));
  }
}
