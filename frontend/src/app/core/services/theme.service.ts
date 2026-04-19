import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkModeObj = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this.isDarkModeObj.asObservable();

  constructor() {
    this.detectSystemTheme();
  }

  private detectSystemTheme(): void {
    const savedTheme = localStorage.getItem('theme-preference');

    if (savedTheme === 'dark') {
      this.setDarkMode(true);
    } else if (savedTheme === 'light') {
      this.setDarkMode(false);
    } else {
      // Fallback to system preferences
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setDarkMode(prefersDark);
    }
  }

  public toggleMode(): void {

    this.setDarkMode(!this.isDarkModeObj.value);
  }

  private setDarkMode(isDark: boolean): void {

    this.isDarkModeObj.next(isDark);

    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme-preference', 'dark');

    } else {

      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme-preference', 'light');
    }
  }

}
