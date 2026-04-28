import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DashboardActivityItemView } from '../../../../models/dashboard.model';

@Component({
  selector: 'app-activity-feed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-feed.component.html',
  styleUrl: './activity-feed.component.scss',
})
export class ActivityFeedComponent {
  @Input({ required: true }) items: DashboardActivityItemView[] = [];
}
