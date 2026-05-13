import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StudentPreviewItem } from '../../models/student-dashboard.models';

@Component({
  selector: 'app-student-preview-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './student-preview-card.component.html',
  styleUrl: './student-preview-card.component.scss',
})
export class StudentPreviewCardComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) icon = '';
  @Input({ required: true }) route = '';
  @Input() emptyStateText = 'No recent items.';
  @Input() items: StudentPreviewItem[] = [];

  get previewItems(): StudentPreviewItem[] {
    return this.items.slice(0, 5);
  }
}
