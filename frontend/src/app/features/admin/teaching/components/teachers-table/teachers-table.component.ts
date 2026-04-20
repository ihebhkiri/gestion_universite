import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DatePipe} from '@angular/common';
import {Teacher} from '../../models/teaching.model';

@Component({
  selector: 'app-teachers-table',
  imports: [DatePipe],
  templateUrl: './teachers-table.component.html',
  styleUrl: './teachers-table.component.scss',
})
export class TeachersTableComponent {
  @Input() teachers: Teacher[] = [];

  @Output() editTeacher = new EventEmitter<Teacher>();
  @Output() removeTeacher = new EventEmitter<number>();

  protected onDelete(id: number) {
    this.removeTeacher.emit(id);
  }
}
