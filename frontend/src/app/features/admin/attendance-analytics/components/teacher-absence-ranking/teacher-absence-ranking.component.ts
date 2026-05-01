import {CommonModule} from '@angular/common';
import {animate, query, stagger, style, transition, trigger} from '@angular/animations';
import {Component, Input} from '@angular/core';
import {TeacherAbsenceStat} from '../../models/attendance-analytics.model';

@Component({
  selector: 'app-teacher-absence-ranking',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './teacher-absence-ranking.component.html',
  animations: [
    trigger('rankingEnter', [
      transition('* => *', [
        query('.ranking-row', [
          style({opacity: 0, transform: 'translateY(10px)'}),
          stagger(45, animate('280ms ease-out', style({opacity: 1, transform: 'translateY(0)'})))
        ], {optional: true})
      ])
    ])
  ]
})
export class TeacherAbsenceRankingComponent {
  @Input() teachers: TeacherAbsenceStat[] = [];
}
