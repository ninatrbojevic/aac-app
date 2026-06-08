import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../users/users.service';
import { AuthService } from '../shared/auth.service';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { InputText } from 'primeng/inputtext';
import { ButtonDirective } from 'primeng/button';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Toast, InputText, ButtonDirective],
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

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    this.profileForm = new FormGroup({
      name: new FormControl(this.currentUser?.name ?? '', [Validators.required]),
      last_name: new FormControl(this.currentUser?.last_name ?? '', [Validators.required]),
      email: new FormControl(this.currentUser?.email ?? '', [Validators.required, Validators.email]),
      username: new FormControl(this.currentUser?.username ?? ''),
      organization: new FormControl(this.currentUser?.organization ?? ''),
    });

    this.passwordForm = new FormGroup({
      currentPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required]),
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.userService.updateUser(this.currentUser._id, this.profileForm.value).subscribe({
      next: (updatedUser) => {
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
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

    const { newPassword, confirmPassword, currentPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Upozorenje',
        detail: 'Nove lozinke se ne podudaraju.'
      });
      return;
    }

    this.userService.changePassword(this.currentUser._id, currentPassword, newPassword).subscribe({
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
          detail: err.error?.message ?? 'Promjena lozinke nije uspjela.'
        });
      }
    });
  }
}