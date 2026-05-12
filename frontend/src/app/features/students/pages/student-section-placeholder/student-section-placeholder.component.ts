import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StudentHeaderComponent } from '../../../../shared/students/student-header/student-header.component';

interface StudentSectionRouteData {
  title?: string;
  icon?: string;
  description?: string;
}

@Component({
  selector: 'app-student-section-placeholder',
  standalone: true,
  imports: [RouterLink, StudentHeaderComponent],
  templateUrl: './student-section-placeholder.component.html',
  styleUrl: './student-section-placeholder.component.scss',
})
export class StudentSectionPlaceholderComponent {
  readonly title: string;
  readonly icon: string;
  readonly description: string;

  constructor(route: ActivatedRoute) {
    const data = route.snapshot.data as StudentSectionRouteData;
    this.title = data.title ?? 'Student Section';
    this.icon = data.icon ?? 'apps';
    this.description = data.description ?? 'This student section is ready for future content.';
  }
}
