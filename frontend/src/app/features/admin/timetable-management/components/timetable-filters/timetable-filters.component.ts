import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {TimetableFacadeService} from '../../services/timetable-facade.service';

@Component({
  selector: 'app-timetable-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './timetable-filters.component.html',
  styleUrl: './timetable-filters.component.scss'
})
export class TimetableFiltersComponent {
  constructor(public readonly facade: TimetableFacadeService) {}
}
