import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';
import {StudentPaymentHistory} from '../../models/student-payment.model';

@Component({
  selector: 'app-student-payment-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-payment-history.component.html',
  styleUrl: './student-payment-history.component.scss'
})
export class StudentPaymentHistoryComponent {
  @Input() history: StudentPaymentHistory[] = [];

  paymentMethodLabel(method: StudentPaymentHistory['paymentMethod']): string {
    const labels: Record<StudentPaymentHistory['paymentMethod'], string> = {
      MONTHLY_600_TND: 'Mensuel 600 TND'
    };

    return labels[method];
  }

  money(value: number): string {
    return new Intl.NumberFormat('fr-TN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  }
}
