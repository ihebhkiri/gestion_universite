import { Component, inject, OnInit } from '@angular/core';
import { StudentHeaderComponent } from '../../../../shared/students/student-header/student-header.component';
import { StudentProfile } from '../../models/student-profile.model';
import { StudentsService } from '../../services/students.service';

@Component({
  selector: 'app-student-profile',
  standalone: true,
  imports: [StudentHeaderComponent],
  templateUrl: './student-profile.component.html',
  styleUrl: './student-profile.component.scss',
})
export class StudentProfileComponent implements OnInit {
  private readonly studentService = inject(StudentsService);

  profile: StudentProfile | null = null;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadProfile();
  }

  get displayName(): string {
    return this.valueOrFallback(this.profile?.fullName, 'Student');
  }

  getAvatarUrl(profile: StudentProfile | null): string {
    const name = profile?.fullName?.trim() || 'Student';
    const avatarUrl = profile?.avatarUrl?.trim();

    if (avatarUrl && avatarUrl.length > 0) {
      return avatarUrl;
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
  }

  valueOrFallback(value: string | null | undefined, fallback = 'Not specified'): string {
    const normalized = value?.trim();
    return normalized && normalized.length > 0 ? normalized : fallback;
  }

  private loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.studentService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.isLoading = false;
      },
      error: () => {
        this.profile = null;
        this.errorMessage = 'Unable to load your student profile right now.';
        this.isLoading = false;
      },
    });
  }
}
