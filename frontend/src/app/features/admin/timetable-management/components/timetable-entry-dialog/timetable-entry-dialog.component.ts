import {animate, style, transition, trigger} from '@angular/animations';
import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {TimetableFacadeService} from '../../services/timetable-facade.service';

@Component({
  selector: 'app-timetable-entry-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  animations: [
    trigger('dialogIn', [
      transition(':enter', [
        style({opacity: 0}),
        animate('140ms ease-out', style({opacity: 1}))
      ]),
      transition(':leave', [
        animate('120ms ease-in', style({opacity: 0}))
      ])
    ]),
    trigger('panelIn', [
      transition(':enter', [
        style({opacity: 0, transform: 'translateY(14px) scale(0.98)'}),
        animate('180ms ease-out', style({opacity: 1, transform: 'translateY(0) scale(1)'}))
      ])
    ])
  ],
  templateUrl: './timetable-entry-dialog.component.html',
  styleUrl: './timetable-entry-dialog.component.scss'
})
export class TimetableEntryDialogComponent {
  constructor(public readonly facade: TimetableFacadeService) {}
}
