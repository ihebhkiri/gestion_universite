import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormGroup, ReactiveFormsModule} from '@angular/forms';
import {AcademicClassResponse} from '../../../academic-class-managment/models/academic-class.model';
import {AcademicYearResponse} from '../../../academic-year-managment/models/academic-year.model';
import {SemesterResponse} from '../../../semester-managment/models/semester.model';
import {GroupResponse} from '../../../student-managment/models/group.model';

@Component({
  selector: 'app-analytics-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './analytics-filters.component.html'
})
export class AnalyticsFiltersComponent {
  @Input({required: true}) form!: FormGroup;
  @Input() academicYears: AcademicYearResponse[] = [];
  @Input() semesters: SemesterResponse[] = [];
  @Input() classes: AcademicClassResponse[] = [];
  @Input() groups: GroupResponse[] = [];
  @Output() refreshed = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();
}
