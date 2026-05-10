import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [FormsModule, RouterLink],
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

  onRegistracija() {
    console.log('Registracija:', this.ime, this.prezime, this.email);
  }
}
