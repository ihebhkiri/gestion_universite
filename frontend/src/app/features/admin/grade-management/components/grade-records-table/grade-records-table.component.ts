import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Exam, GradeRecord} from '../../models/grade-management.model';

@Component({
  selector: 'app-grade-records-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grade-records-table.component.html',
  styleUrl: './grade-records-table.component.scss'
})
export class GradeRecordsTableComponent {
  @Input() records: GradeRecord[] | null = [];
  @Input() currentExam: Exam | null = null;
  @Output() validateRequested = new EventEmitter<number>();
}
