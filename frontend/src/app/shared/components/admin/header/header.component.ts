import {Component, HostListener, inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../../../auth/auth.service';
import {ThemeService} from '../../../../core/services/theme.service';
import {Me} from '../../../../auth/models/Me.model';
import {ToastrService} from 'ngx-toastr';
import {AsyncPipe} from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [
    AsyncPipe
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent  {
  private readonly authService = inject(AuthService)
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  protected readonly themeService = inject(ThemeService);
  isDropdownOpen: boolean = false;
  formatName = (name: string) => {
    return name.split('@')[0];
  }



  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click')
  closeDropdown() {
    this.isDropdownOpen = false;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.toastr.success('Logged out successfully');
        this.router.navigate(['/auth']);
      },
      error: () => {
        this.toastr.error('Logout failed');
      }
    });
  }
}





