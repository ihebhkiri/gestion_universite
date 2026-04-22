import {Component} from '@angular/core';
import {SidebarComponent} from '../../../../shared/components/admin/sidebar/sidebar.component';
import {HeaderComponent} from '../../../../shared/components/admin/header/header.component';

@Component({
  selector: 'app-dashboard',
  imports: [
    SidebarComponent,
    HeaderComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {

}
