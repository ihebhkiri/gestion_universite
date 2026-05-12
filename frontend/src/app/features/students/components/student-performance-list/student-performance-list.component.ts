import { Component, Input } from '@angular/core';
import { StudentPerformanceItem } from '../../models/student-dashboard.models';

@Component({
  selector: 'app-student-performance-list',
  standalone: true,
  imports: [],
  templateUrl: './student-performance-list.component.html',
  styleUrl: './student-performance-list.component.scss',
})
export class StudentPerformanceListComponent {
  @Input({ required: true }) items: StudentPerformanceItem[] = [];
}
