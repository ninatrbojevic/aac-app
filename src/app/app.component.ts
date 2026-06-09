import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './shared/auth.service';
import { UserRole } from './user-role';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  sidebarOpen = false;
  isLoginPage = false;
  userMenuOpen = false;

  get userRole(): string {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return '';
    const user = JSON.parse(raw);
    return user.role ?? '';
  }

  get userFullName(): string {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return '';
    const user = JSON.parse(raw);
    return `${user.name ?? ''} ${user.last_name ?? ''}`.trim();
  }

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isLoginPage =
          event.urlAfterRedirects === '/login' ||
          event.urlAfterRedirects === '/register';
        this.userMenuOpen = false;
      }
    });
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  goToSettings(event: Event): void {
    event.stopPropagation();
    this.userMenuOpen = false;
    this.router.navigate(['/settings']);
  }

  logout(event: Event): void {
    event.stopPropagation();
    this.authService.logout();
    this.userMenuOpen = false;
    this.router.navigate(['/login']);
  }

  isAdmin(): boolean {
    return this.authService.userHasRole(UserRole.Admin);
  }

  get userTitle(): string {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return '';
    const user = JSON.parse(raw);
    return user.title ?? '';
  }
}