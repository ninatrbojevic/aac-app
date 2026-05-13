import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

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

  onRegistracija() {
    console.log('Registracija:', this.ime, this.prezime, this.email);
  }
}
