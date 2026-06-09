import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { UserService } from '../users/users.service';
import { AuthService } from '../shared/auth.service';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { InputText } from 'primeng/inputtext';
import { ButtonDirective } from 'primeng/button';
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  switchMap,
  of
} from 'rxjs';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Toast,
    InputText,
    ButtonDirective
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
  providers: [MessageService]
})
export class UserProfileComponent implements OnInit {
  profileForm!: FormGroup;
  passwordForm!: FormGroup;

  currentUser: any = null;

  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  usernameZauzet = false;
  usernameProvjerava = false;

  private usernameInput$ = new Subject<string>();

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    console.log('Current user:', this.currentUser);

    // Forma za osobne podatke
    this.profileForm = new FormGroup({
      name: new FormControl(this.currentUser?.name ?? '', Validators.required),
      last_name: new FormControl(
        this.currentUser?.last_name ?? '',
        Validators.required
      ),
      email: new FormControl(this.currentUser?.email ?? '', [
        Validators.required,
        Validators.email
      ]),
      username: new FormControl(this.currentUser?.username ?? ''),
      organization: new FormControl(this.currentUser?.organization ?? ''),
      title: new FormControl(this.currentUser?.title ?? '')
    });

    // Forma za promjenu lozinke
    this.passwordForm = new FormGroup({
      currentPassword: new FormControl('', Validators.required),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8)
      ]),
      confirmPassword: new FormControl('', Validators.required)
    });

    this.usernameInput$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((username) => {
          if (!username || username.length < 3) {
            this.usernameZauzet = false;
            this.usernameProvjerava = false;
            return of({ taken: false });
          }

          // Ako nije promijenjeno korisničko ime
          if (username === this.currentUser?.username) {
            this.usernameZauzet = false;
            this.usernameProvjerava = false;
            return of({ taken: false });
          }

          this.usernameProvjerava = true;
          return this.userService.checkUsername(username);
        })
      )
      .subscribe({
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
    this.usernameInput$.next(
      this.profileForm.get('username')?.value ?? ''
    );
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const username = this.profileForm.get('username')?.value;

    if (username && username.length < 3) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Upozorenje',
        detail: 'Korisničko ime mora imati najmanje 3 znaka.'
      });
      return;
    }

    if (this.usernameZauzet) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Upozorenje',
        detail: 'Korisničko ime je već zauzeto.'
      });
      return;
    }

    this.userService
      .updateUser(this.currentUser._id, this.profileForm.value)
      .subscribe({
        next: (updatedUser: any) => {
          localStorage.setItem(
            'currentUser',
            JSON.stringify(updatedUser)
          );

          this.currentUser = updatedUser;

          this.messageService.add({
            severity: 'success',
            summary: 'Uspješno',
            detail: 'Podaci su uspješno ažurirani.'
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Greška',
            detail: 'Ažuriranje nije uspjelo.'
          });
        }
      });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const {
      currentPassword,
      newPassword,
      confirmPassword
    } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Upozorenje',
        detail: 'Nove lozinke se ne podudaraju.'
      });
      return;
    }

    this.userService
      .changePassword(
        this.currentUser._id,
        currentPassword,
        newPassword
      )
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Uspješno',
            detail: 'Lozinka je uspješno promijenjena.'
          });

          this.passwordForm.reset();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Greška',
            detail:
              err.error?.message ??
              'Promjena lozinke nije uspjela.'
          });
        }
      });
  }
}