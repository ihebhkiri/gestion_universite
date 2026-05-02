import {CommonModule} from '@angular/common';
import {Component, OnInit} from '@angular/core';
import {animate, style, transition, trigger} from '@angular/animations';
import {HeaderComponent} from '../../../../../shared/components/admin/header/header.component';
import {SidebarComponent} from '../../../../../shared/components/admin/sidebar/sidebar.component';
import {GradeRecordsTableComponent} from '../../components/grade-records-table/grade-records-table.component';
import {GradeManagementFacade} from '../../facades/grade-management.facade';
import {GradeManagementStateService} from '../../services/grade-management-state.service';

@Component({
  selector: 'app-grade-management-page',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    HeaderComponent,
    GradeRecordsTableComponent
  ],
  providers: [GradeManagementStateService, GradeManagementFacade],
  templateUrl: './grade-management-page.component.html',
  styleUrl: './grade-management-page.component.scss',
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({opacity: 0, transform: 'translateY(12px)'}),
        animate('220ms ease-out', style({opacity: 1, transform: 'translateY(0)'}))
      ])
    ])
  ]
})
export class GradeManagementPageComponent implements OnInit {
  constructor(public readonly facade: GradeManagementFacade) {}

  ngOnInit(): void {
    this.facade.loadCourseOptions();
  }

  onCourseChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    if (Number.isFinite(value) && value > 0) {
      this.facade.loadExamsByCourse(value);
    }
  }
}
