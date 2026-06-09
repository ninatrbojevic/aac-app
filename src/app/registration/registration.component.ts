import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../users/users.service';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';

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
  username = '';
  lozinka = '';
  lozinkaRepeat = '';

  greska = '';
  showPassword = false;
  showPasswordRepeat = false;

  usernameZauzet = false;
  usernameProvjerava = false;

  title = '';

  private usernameInput$ = new Subject<string>();

  constructor(private userService: UserService, private router: Router) {
    this.usernameInput$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap(username => {
        if (!username || username.length < 3) {
          this.usernameZauzet = false;
          this.usernameProvjerava = false;
          return [];
        }
        this.usernameProvjerava = true;
        return this.userService.checkUsername(username);
      })
    ).subscribe({
      next: (res: any) => {
        this.usernameZauzet = res.taken;
        this.usernameProvjerava = false;
      },
      error: () => {
        this.usernameProvjerava = false;
      }
    });
  }

  onUsernameInput(): void {
    this.usernameInput$.next(this.username);
  }

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

    if (this.usernameZauzet) {
      this.greska = 'Korisničko ime je već zauzeto.';
      return;
    }
    
    if (this.username && this.username.length < 3) {
      this.greska = 'Korisničko ime mora imati najmanje 3 znaka.';
      return;
    }

    const payload = {
      name: this.ime,
      last_name: this.prezime,
      email: this.email,
      username: this.username,
      organization: this.fakultet,
      role: this.uloga,
      password: this.lozinka,
      title: this.uloga === 'Profesor' ? this.title : ''
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