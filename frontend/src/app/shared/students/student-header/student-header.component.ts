import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { StudentProfile } from '../../../features/students/models/student-profile.model';
import {StudentsService} from '../../../features/students/services/students.service';

interface StudentNavItem {
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
}

@Component({
  selector: 'app-student-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './student-header.component.html',
  styleUrl: './student-header.component.scss',
})
export class StudentHeaderComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly studentsService = inject(StudentsService);

  profile: StudentProfile | null = null;
  isProfileLoading = true;
  hasProfileError = false;
  isProfileMenuOpen = false;

  readonly navItems: StudentNavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/students/dashboard', exact: true },
    { label: 'Timetable', icon: 'calendar_today', route: '/students/timetable' },
    { label: 'Courses', icon: 'auto_stories', route: '/students/courses' },
    { label: 'Results', icon: 'grade', route: '/students/results' },
    { label: 'Exams', icon: 'quiz', route: '/students/exams' },
    { label: 'Payments', icon: 'payments', route: '/students/payments' },
    { label: 'Documents', icon: 'folder', route: '/students/documents' },
    { label: 'Attendance', icon: 'fact_check', route: '/students/attendance' },
    { label: 'Announcements', icon: 'campaign', route: '/students/announcements' },
  ];

  ngOnInit(): void {
    this.loadProfile();
  }

  get displayName(): string {
    const fullName = this.profile?.fullName?.trim();
    return fullName && fullName.length > 0 ? fullName : 'Student';
  }

  get displayClassCode(): string {
    const classCode = this.profile?.academicClassCode?.trim();
    return classCode && classCode.length > 0 ? classCode : 'Class not assigned';
  }

  getAvatarUrl(profile: StudentProfile | null): string {
    const name = profile?.fullName?.trim() || 'Student';
    const avatarUrl = profile?.avatarUrl?.trim();

    if (avatarUrl && avatarUrl.length > 0) {
      return avatarUrl;
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
  }

  signOut(event: Event): void {
    event.stopPropagation();
    this.closeProfileMenu();

    this.authService.logout().subscribe({
      next: () => void this.router.navigate(['/auth']),
      error: () => void this.router.navigate(['/auth']),
    });
  }

  toggleProfileMenu(event: Event): void {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeProfileMenu();
  }

  private loadProfile(): void {
    this.isProfileLoading = true;
    this.hasProfileError = false;

    this.studentsService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.isProfileLoading = false;
      },
      error: () => {
        this.profile = null;
        this.hasProfileError = true;
        this.isProfileLoading = false;
      },
    });
  }
}
