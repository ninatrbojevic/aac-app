import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { UserService } from '../users/users.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  lozinka = '';
  greska = '';

  constructor(private userService: UserService, private router: Router) {}

  onLogin() {
    this.greska = '';

    if (!this.email || !this.lozinka) {
      this.greska = 'Uneseni email ili lozinka nisu ispravni';
      return;
    }

    this.userService.login(this.email, this.lozinka).subscribe({
      next: (user) => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.greska = err.error?.message ?? 'Prijava nije uspjela. Pokušajte ponovo.';
      }
    });
  }
}
