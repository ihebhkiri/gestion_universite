import { Component, Input } from '@angular/core';
import { StudentKpiCard } from '../../models/student-dashboard.models';

@Component({
  selector: 'app-student-kpi-cards',
  standalone: true,
  imports: [],
  templateUrl: './student-kpi-cards.component.html',
  styleUrl: './student-kpi-cards.component.scss',
})
export class StudentKpiCardsComponent {
  @Input({ required: true }) cards: StudentKpiCard[] = [];
}
