import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddSubjectRequest } from '../../models/subject.model';

@Component({
  selector: 'app-add-subject',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-subject.component.html',
  styleUrl: './add-subject.component.scss'
})
export class AddSubjectComponent {
  @Input() isVisible = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<AddSubjectRequest>();

  form: AddSubjectRequest = {
    subjectName: '',
  };

  onSubmit(): void {
    if (!this.form.subjectName ) {
      return;
    }
    this.save.emit({ ...this.form });
    this.reset();
  }

  onClose(): void {
    this.close.emit();
    this.reset();
  }

  private reset(): void {
    this.form = { subjectName: '' };
  }
}
