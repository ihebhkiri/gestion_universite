import { Component, Input } from '@angular/core';
import {
  StudentAnnouncement,
  StudentExamItem,
  StudentTaskItem,
} from '../../models/student-dashboard.models';

@Component({
  selector: 'app-student-side-panel',
  standalone: true,
  imports: [],
  templateUrl: './student-side-panel.component.html',
  styleUrl: './student-side-panel.component.scss',
})
export class StudentSidePanelComponent {
  @Input({ required: true }) exams: StudentExamItem[] = [];
}
