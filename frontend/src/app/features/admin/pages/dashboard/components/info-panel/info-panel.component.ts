import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DashboardPanelItem } from '../../../../models/dashboard.model';

@Component({
  selector: 'app-info-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './info-panel.component.html',
  styleUrl: './info-panel.component.scss',
})
export class InfoPanelComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) subtitle = '';
  @Input({ required: true }) icon = '';
  @Input({ required: true }) emptyText = '';
  @Input({ required: true }) items: DashboardPanelItem[] = [];
}
