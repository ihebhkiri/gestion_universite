import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../../../../shared/components/admin/sidebar/sidebar.component';
import { HeaderComponent } from '../../../../../shared/components/admin/header/header.component';
import { StudentService } from '../../services/student.service';
import { GroupService } from '../../services/group.service';
import { EnrollmentService } from '../../services/enrollment.service';
import { StudentResponse } from '../../models/student.model';
import { GroupResponse } from '../../models/group.model';
import { EnrollStudentRequest } from '../../models/enrollment.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-enrollment-management',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, HeaderComponent],
  templateUrl: './enrollment-management.component.html',
  styleUrl: './enrollment-management.component.scss'
})
export class EnrollmentManagementComponent implements OnInit {
  students: StudentResponse[] = [];
  groups: GroupResponse[] = [];
  
  selectedStudentId: number | null = null;
  selectedGroupId: number | null = null;
  loadingData = false;
  submitting = false;
  private returnUrl: string | null = null;

  constructor(
    private studentService: StudentService,
    private groupService: GroupService,
    private enrollmentService: EnrollmentService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const qp = this.route.snapshot.queryParamMap;
    const studentIdParam = qp.get('studentId');
    this.returnUrl = qp.get('returnUrl');
    if (studentIdParam) {
      const parsed = Number(studentIdParam);
      if (!Number.isNaN(parsed)) {
        this.selectedStudentId = parsed;
      }
    }
    this.loadData();
  }

  loadData(): void {
    this.loadingData = true;
    
    // Using simple approach instead of forkJoin to keep it straightforward and avoid extra imports
    this.studentService.getStudents('', 0, 1000).subscribe({
      next: (res) => {
        this.students = res.content;
        this.groupService.getGroups().subscribe({
          next: (groups) => {
            this.groups = groups;
            this.loadingData = false;
          },
          error: (err) => {
            console.error('Error fetching groups', err);
            this.loadingData = false;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching students', err);
        this.loadingData = false;
      }
    });
  }

  onSubmit(): void {
    if (this.selectedStudentId && this.selectedGroupId) {
      this.submitting = true;
      const request: EnrollStudentRequest = { studentId: this.selectedStudentId };
      
      this.enrollmentService.enrollStudentToGroup(this.selectedGroupId, request).subscribe({
        next: () => {
          this.submitting = false;
          const to = this.returnUrl || '/admins/students';
          this.router.navigateByUrl(to);
        },
        error: (err) => {
          this.submitting = false;
          console.error('Failed to enroll student', err);
          alert('Failed to enroll student. They might already be active in a group.');
        }
      });
    }
  }
}
