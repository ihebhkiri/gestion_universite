import { Component, Input } from '@angular/core';
import { StudentFinanceTransaction } from '../../models/student-dashboard.models';

@Component({
  selector: 'app-student-finance-table',
  standalone: true,
  imports: [],
  templateUrl: './student-finance-table.component.html',
  styleUrl: './student-finance-table.component.scss',
})
export class StudentFinanceTableComponent {
  @Input({ required: true }) transactions: StudentFinanceTransaction[] = [];
}
