import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {RoomFacadeService} from '../../services/room-facade.service';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-list.component.html',
  styleUrl: './room-list.component.scss'
})
export class RoomListComponent {
  constructor(public readonly facade: RoomFacadeService) {}
}
