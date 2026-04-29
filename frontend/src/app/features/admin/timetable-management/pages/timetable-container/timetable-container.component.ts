import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {HeaderComponent} from '../../../../../shared/components/admin/header/header.component';
import {SidebarComponent} from '../../../../../shared/components/admin/sidebar/sidebar.component';
import {TimetableEntryDialogComponent} from '../../components/timetable-entry-dialog/timetable-entry-dialog.component';
import {TimetableFiltersComponent} from '../../components/timetable-filters/timetable-filters.component';
import {TimetableGridComponent} from '../../components/timetable-grid/timetable-grid.component';
import {TimetableFacadeService} from '../../services/timetable-facade.service';

@Component({
  selector: 'app-timetable-container',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SidebarComponent,
    HeaderComponent,
    TimetableFiltersComponent,
    TimetableGridComponent,
    TimetableEntryDialogComponent
  ],
  providers: [TimetableFacadeService],
  templateUrl: './timetable-container.component.html',
  styleUrl: './timetable-container.component.scss'
})
export class TimetableContainerComponent {
  constructor(public readonly facade: TimetableFacadeService) {}
}
