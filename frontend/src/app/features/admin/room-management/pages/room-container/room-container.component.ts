import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {HeaderComponent} from '../../../../../shared/components/admin/header/header.component';
import {SidebarComponent} from '../../../../../shared/components/admin/sidebar/sidebar.component';
import {RoomFormComponent} from '../../components/room-form/room-form.component';
import {RoomListComponent} from '../../components/room-list/room-list.component';
import {RoomFacadeService} from '../../services/room-facade.service';

@Component({
  selector: 'app-room-container',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SidebarComponent,
    HeaderComponent,
    RoomListComponent,
    RoomFormComponent
  ],
  providers: [RoomFacadeService],
  templateUrl: './room-container.component.html',
  styleUrl: './room-container.component.scss'
})
export class RoomContainerComponent implements OnInit {
  constructor(public readonly facade: RoomFacadeService) {}

  ngOnInit(): void {
    this.facade.loadRooms();
  }
}
