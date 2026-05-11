import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {StudentPaymentSummary} from '../../models/student-payment.model';

@Component({
  selector: 'app-student-payment-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-payment-card.component.html',
  styleUrl: './student-payment-card.component.scss'
})
export class StudentPaymentCardComponent {
  @Input() summary: StudentPaymentSummary | null = null;
  @Input() loading = false;
  @Input() paymentLoading = false;
  @Input() error: string | null = null;

  @Output() pay = new EventEmitter<void>();

  academicPathLabel(path: StudentPaymentSummary['academicPath']): string {
    const labels: Record<StudentPaymentSummary['academicPath'], string> = {
      PREP: 'Cycle préparatoire',
      ING: 'Cycle ingénieur'
    };

    return labels[path];
  }


  statusLabel(status: StudentPaymentSummary['paymentStatus']): string {
    const labels: Record<StudentPaymentSummary['paymentStatus'], string> = {
      NOT_STARTED: 'Non commencé',
      IN_PROGRESS: 'En cours',
      PAID: 'Payé'
    };

    return labels[status];
  }

  statusClass(status: StudentPaymentSummary['paymentStatus']): string {
    const classes: Record<StudentPaymentSummary['paymentStatus'], string> = {
      NOT_STARTED: 'bg-tertiary-fixed text-on-primary-fixed-variant',
      IN_PROGRESS: 'bg-blue-100 text-blue-800',
      PAID: 'bg-[#ecfdf5] text-[#065f46]'
    };

    return classes[status];
  }


}
