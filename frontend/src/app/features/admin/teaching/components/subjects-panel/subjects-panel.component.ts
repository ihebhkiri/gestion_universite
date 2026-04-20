import {Component, EventEmitter, Input, Output, inject} from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Subject} from '../../models/teaching.model';

@Component({
  selector: 'app-subjects-panel',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './subjects-panel.component.html',
  styleUrl: './subjects-panel.component.scss',
})
export class SubjectsPanelComponent {
  private readonly fb = inject(FormBuilder);

  @Input() subjects: Subject[] = [];

  @Output() addSubject = new EventEmitter<string>();
  @Output() updateSubject = new EventEmitter<{ id: number; subjectName: string }>();
  @Output() deleteSubject = new EventEmitter<number>();

  protected editingId: number | null = null;
  protected editingName = '';

  protected form = this.fb.group({
    subjectName: ['', [Validators.required, Validators.minLength(2)]],
  });

  protected onCreate() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.addSubject.emit(this.form.value.subjectName!.trim());
    this.form.reset();
  }

  protected startEdit(subject: Subject) {
    this.editingId = subject.id;
    this.editingName = subject.subjectName;
  }

  protected cancelEdit() {
    this.editingId = null;
    this.editingName = '';
  }

  protected submitEdit(id: number) {
    const name = this.editingName.trim();
    if (!name) {
      return;
    }

    this.updateSubject.emit({id, subjectName: name});
    this.cancelEdit();
  }
}
