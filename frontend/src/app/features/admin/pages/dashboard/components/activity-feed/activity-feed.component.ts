import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ActivityFeedItem } from '../../../../models/dashboard.model';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './activity-feed.component.html',
  styleUrl: './activity-feed.component.scss',
})
export class ActivityFeedComponent {
  @Input({ required: true }) items: ActivityFeedItem[] = [];

  getIcon(type: string): string {
    if (type === 'teacher') {
      return 'co_present';
    }

    if (type === 'exam') {
      return 'assignment';
    }

    return 'how_to_reg';
  }
}
