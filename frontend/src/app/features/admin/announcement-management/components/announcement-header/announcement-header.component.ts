import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-announcement-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './announcement-header.component.html',
  styleUrl: './announcement-header.component.scss'
})
export class AnnouncementHeaderComponent {
  @Input() loading = false;
  @Output() create = new EventEmitter<void>();
}
