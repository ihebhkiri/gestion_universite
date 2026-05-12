import { Component, Input } from '@angular/core';
import { StudentAgendaItem } from '../../models/student-dashboard.models';

@Component({
  selector: 'app-student-agenda',
  standalone: true,
  imports: [],
  templateUrl: './student-agenda.component.html',
  styleUrl: './student-agenda.component.scss',
})
export class StudentAgendaComponent {
  @Input({ required: true }) items: StudentAgendaItem[] = [];
  @Input() dateLabel = '';
}
