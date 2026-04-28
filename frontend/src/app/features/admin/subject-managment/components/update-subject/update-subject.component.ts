import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddSubjectRequest, SubjectResponse } from '../../models/subject.model';

@Component({
  selector: 'app-update-subject',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-subject.component.html',
  styleUrl: './update-subject.component.scss'
})
export class UpdateSubjectComponent implements OnChanges {
  @Input() isVisible = false;
  @Input() subject: SubjectResponse | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ id: number; request: AddSubjectRequest }>();

  form: AddSubjectRequest = {
    subjectName: '',
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['subject'] && this.subject) {
      this.form = {
        subjectName: this.subject.subjectName,
      };
    }
  }

  onSubmit(): void {
    if (!this.subject || !this.form.subjectName ) {
      return;
    }
    this.save.emit({ id: this.subject.id, request: { ...this.form } });
  }

  onClose(): void {
    this.close.emit();
  }
}
