import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ResultSessionLike} from '../result-ui.types';

@Component({
  selector: 'app-result-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result-header.component.html',
  styleUrl: './result-header.component.scss'
})
export class ResultHeaderComponent {
  @Input() session: ResultSessionLike | null = null;
  @Input() loading = false;
  @Output() validateRequested = new EventEmitter<void>();
  @Output() publishRequested = new EventEmitter<void>();

  get title(): string {
    return this.session?.title ?? this.session?.name ?? this.session?.examTitle ?? 'Result Management';
  }

  get status(): string {
    return this.session?.status ?? 'PENDING';
  }

  get classLabel(): string {
    return this.session?.classCode
      ?? this.session?.academicClassCode
      ?? this.session?.className
      ?? this.session?.academicClassName
      ?? 'Classe non definie';
  }

  get subjectLabel(): string {
    const code = this.session?.subjectCode ?? this.session?.courseCode;
    const title = this.session?.subjectTitle ?? this.session?.courseTitle;
    if (code && title) return `${code} - ${title}`;
    return code ?? title ?? 'Matiere non definie';
  }

  get semesterLabel(): string {
    return this.session?.semesterName ?? this.session?.semesterLabel ?? 'Semestre non defini';
  }

  get yearLabel(): string {
    return `${this.session?.academicYearLabel ?? this.session?.academicYear ?? this.session?.year ?? 'Annee non definie'}`;
  }

  get isPublished(): boolean {
    return this.status === 'PUBLISHED';
  }

  get canAct(): boolean {
    return !!this.session && !this.loading && !this.isPublished;
  }

  get canValidate(): boolean {
    return !!this.session && !this.loading && this.status === 'DRAFT';
  }

  get canPublish(): boolean {
    return !!this.session && !this.loading && this.status === 'VALIDATED';
  }
}
