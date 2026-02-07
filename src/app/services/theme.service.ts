import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  isDarkMode = signal(false);

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    // Check localStorage for saved preference, or use system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.isDarkMode.set(savedTheme === 'dark');
    } else {
      this.isDarkMode.set(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    this.applyTheme();

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.isDarkMode.set(e.matches);
        this.applyTheme();
      }
    });
  }

  toggleTheme(): void {
    this.isDarkMode.update(value => !value);
    this.applyTheme();
    localStorage.setItem('theme', this.isDarkMode() ? 'dark' : 'light');
  }

  private applyTheme(): void {
    if (this.isDarkMode()) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
}
