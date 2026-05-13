import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { UserService } from './users.service';
import { Button, ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.css',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    TableModule,
    ButtonDirective,
    Dialog,
    InputText,
    Button,
    FormsModule,
    ReactiveFormsModule,
    ConfirmDialog
  ],
})
export class UsersComponent implements OnInit {
  users: any[] = [];

  visibleDialogForm = false;

  form!: FormGroup;

  selectedUser: any | null = null;

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadUsers();
  }


  private initForm() {
    this.form = new FormGroup({
      name: new FormControl('', [Validators.required]),
      last_name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required]),
      organization: new FormControl(''),
      role: new FormControl('')
    });
  }


  showCreateDialog() {
    this.selectedUser = null;
    this.form.reset();
    this.visibleDialogForm = true;
  }

  openUpdateDialog(user: any) {
    this.selectedUser = user;

    this.form.reset();

    this.form.patchValue({
      name: user.name,
      last_name: user.last_name,
      email: user.email,
      organization: user.organization,
      role: user.role
    });

    this.visibleDialogForm = true;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      this.messageService.add({
        severity: 'warn',
        summary: 'Incomplete data',
        detail: 'Please check form fields.',
      });

      return;
    }

    if (this.selectedUser) {
      this.updateUser();
    } else {
      this.createUser();
    }
  }

  private createUser() {
    const payload = this.form.value;

    this.userService.createUser(payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'User created successfully.',
        });

        this.closeDialog();
        this.loadUsers();
      },
      error: (err) => {
        console.log('CREATE ERROR:', err);

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create user.',
        });
      }
    });
  }


  private updateUser() {
    if (!this.selectedUser) return;

    const payload = this.form.value;

    this.userService.updateUser(this.selectedUser._id, payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'User updated successfully.',
        });

        this.closeDialog();
        this.loadUsers();
      },
      error: (err) => {
        console.log('UPDATE ERROR:', err);

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update user.',
        });
      }
    });
  }

  confirmDelete(user: any) {
    this.confirmationService.confirm({
      message: `Jeste li sigurni da želite obrisati korisnika ${user.name} ${user.last_name}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',

      acceptLabel: 'Obriši',
      rejectLabel: 'Odustani',

      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-secondary',

      accept: () => {
        this.deleteUser(user._id);
      }
    });
  }

  private deleteUser(id: string) {
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'User deleted successfully.',
        });

        this.loadUsers();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete user.',
        });
      }
    });
  }


  private loadUsers() {
    this.userService.getUsers().subscribe({
      next: data => {
        this.users = data || [];
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load users.',
        });
      }
    });
  }

  // -----------------------
  // CLOSE DIALOG
  // -----------------------
  private closeDialog() {
    this.visibleDialogForm = false;
    this.selectedUser = null;
    this.form.reset();
    this.initForm();
  }
}