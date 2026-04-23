import { Component, Input } from '@angular/core';
import { DashboardPanelItem } from '../../../../models/dashboard.model';

@Component({
  selector: 'app-info-panel',
  standalone: true,
  templateUrl: './info-panel.component.html',
  styleUrl: './info-panel.component.scss',
})
export class InfoPanelComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) subtitle = '';
  @Input({ required: true }) icon = '';
  @Input({ required: true }) emptyText = '';
  @Input({ required: true }) items: DashboardPanelItem[] = [];

  getBadgeClass(tone?: DashboardPanelItem['badgeTone']): string {
    return tone ? `panel-item__badge panel-item__badge--${tone}` : 'panel-item__badge';
  }
}
