import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../users/users.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})
export class RegistrationComponent {
  ime = '';
  prezime = '';
  uloga = '';
  fakultet = '';
  email = '';
  emailRepeat = '';
  lozinka = '';
  lozinkaRepeat = '';

  greska = '';
  showPassword = false;
  showPasswordRepeat = false;

  constructor(private userService: UserService, private router: Router) {}

  onRegistracija() {
    this.greska = '';

    if (!this.ime || !this.prezime || !this.uloga || !this.email || !this.lozinka) {
      this.greska = 'Molimo ispunite sva obavezna polja.';
      return;
    }

    if (this.email !== this.emailRepeat) {
      this.greska = 'Email adrese se ne podudaraju.';
      return;
    }

    if (this.lozinka !== this.lozinkaRepeat) {
      this.greska = 'Lozinke se ne podudaraju.';
      return;
    }

    const payload = {
      name: this.ime,
      last_name: this.prezime,
      email: this.email,
      organization: this.fakultet,
      role: this.uloga,
      password: this.lozinka
    };

    this.userService.createUser(payload).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.greska = 'Registracija nije uspjela. Pokušajte ponovo.';
      }
    });
  }
}
