import {CommonModule} from '@angular/common';
import {Component} from '@angular/core';
import {ReactiveFormsModule} from '@angular/forms';
import {HeaderComponent} from '../../../../../shared/components/admin/header/header.component';
import {SidebarComponent} from '../../../../../shared/components/admin/sidebar/sidebar.component';
import {TeacherResponse} from '../../models/teacher.model';
import {TeacherFacade} from '../../services/teacher.facade';

@Component({
  selector: 'app-teacher-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SidebarComponent,
    HeaderComponent
  ],
  providers: [TeacherFacade],
  templateUrl: './teacher-management.component.html',
  styleUrl: './teacher-management.component.scss'
})
export class TeacherManagementComponent {
  protected readonly Math = Math;

  constructor(public readonly facade: TeacherFacade) {}

  checked(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }

  value(event: Event): string {
    return (event.target as HTMLSelectElement).value;
  }

  trackTeacher(_index: number, teacher: TeacherResponse): number {
    return teacher.id;
  }
}
