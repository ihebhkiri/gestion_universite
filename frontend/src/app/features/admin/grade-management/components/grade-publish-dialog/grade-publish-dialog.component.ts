import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Exam, GradeStats} from '../../models/grade-management.model';

@Component({
  selector: 'app-grade-publish-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './grade-publish-dialog.component.html',
  styleUrl: './grade-publish-dialog.component.scss'
})
export class GradePublishDialogComponent {
  @Input() visible = false;
  @Input() exam: Exam | null = null;
  @Input() stats: GradeStats | null = null;
  @Input() loading = false;
  @Output() cancelled = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<number>();

  confirm(): void {
    if (!this.exam) return;
    this.confirmed.emit(this.exam.id);
  }
}
