import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { EventService } from './events.service';
import { ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Checkbox } from 'primeng/checkbox';
import { AuthService, CurrentUser } from '../shared/auth.service';
import { UserRole } from '../user-role';
import { Toast } from 'primeng/toast';
import { UserService } from '../users/users.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrl: './events.component.css',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    TableModule,
    ButtonDirective,
    Dialog,
    InputText,
    IconField,
    InputIcon,
    FormsModule,
    ReactiveFormsModule,
    ConfirmDialog,
    Checkbox,
    Toast
  ],
})
export class EventsComponent implements OnInit {
  events: any[] = [];
  eventSearchQuery = '';

  get filteredEvents(): any[] {
    const q = this.eventSearchQuery.toLowerCase().trim();
    if (!q) return this.events;
    return this.events.filter(e => e.name?.toLowerCase().includes(q));
  }

  visibleDialogForm = false;
  visiblePreviewDialog = false;
  visibleRegisteredDialog = false;

  form!: FormGroup;

  selectedEvent: any | null = null;

  currentUser: CurrentUser | null = null;
  allUsers: CurrentUser[] = [];
  filteredUsers: CurrentUser[] = [];
  userSearchQuery: string = '';
  selectedUserToAdd: CurrentUser | null = null;

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private userService: UserService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadEvents();
  }

  private initForm(): void {
    this.form = new FormGroup({
      name: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      date: new FormControl('', [Validators.required]),
      location: new FormControl(''),
      capacity: new FormControl('', [Validators.required]),
      catering: new FormControl(false),
      collaborators: new FormControl(false),
      duration: new FormControl('', [Validators.required]),
    });
  }

  private loadEvents(): void {
    this.eventService.getEvents().subscribe({
      next: data => {
        this.events = (data || []).map(event => ({
          ...event,
          isRegistered: this.currentUser
            ? event.registeredUsers?.some((u: CurrentUser) => u._id === this.currentUser!._id) ?? false
            : false
        }));
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load events.',
        });
      }
    });
  }

  showCreateDialog(): void {
    this.selectedEvent = null;
    this.form.reset();
    this.visibleDialogForm = true;
  }

  openUpdateDialog(event: any): void {
    this.selectedEvent = event;
    this.form.reset();
    this.form.patchValue({
      name: event.name,
      description: event.description,
      date: event.date,
      location: event.location,
      capacity: event.capacity,
      catering: event.catering,
      collaborators: event.collaborators,
      duration: event.duration
    });
    this.visibleDialogForm = true;
  }

  openPreviewDialog(event: any): void {
    this.selectedEvent = event;
    this.visiblePreviewDialog = true;
  }

  openRegisteredDialog(event: any): void {
    this.selectedEvent = event;
    this.userSearchQuery = '';
    this.selectedUserToAdd = null;
    this.filteredUsers = [];
    this.loadAllUsers();          
    this.visibleRegisteredDialog = true;
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Incomplete data',
        detail: 'Please check form fields.',
      });
      return;
    }

    if (this.selectedEvent) {
      this.updateEvent();
    } else {
      this.createEvent();
    }
  }

  private createEvent(): void {
    const payload = this.form.value;
    this.eventService.createEvent(payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Event created successfully.',
        });
        this.closeDialog();
        this.loadEvents();
      },
      error: (err) => {
        console.error('CREATE ERROR:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create event.',
        });
      }
    });
  }

  private updateEvent(): void {
    if (!this.selectedEvent) return;
    const payload = this.form.value;
    this.eventService.updateEvent(this.selectedEvent._id, payload).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Event updated successfully.',
        });
        this.closeDialog();
        this.loadEvents();
      },
      error: (err) => {
        console.error('UPDATE ERROR:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update event.',
        });
      }
    });
  }

  confirmDelete(event: any): void {
    this.confirmationService.confirm({
      message: `Jeste li sigurni da želite obrisati događaj: ${event.name}?`,
      header: 'Potvrdi',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Obriši',
      rejectLabel: 'Odustani',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.deleteEvent(event._id);
      }
    });
  }

  private deleteEvent(id: string): void {
    this.eventService.deleteEvent(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Event deleted successfully.',
        });
        this.loadEvents();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete event.',
        });
      }
    });
  }

  // private loadEvents(): void {
  //   this.eventService.getEvents().subscribe({
  //     next: data => {
  //       this.events = data || [];
  //     },
  //     error: () => {
  //       this.messageService.add({
  //         severity: 'error',
  //         summary: 'Error',
  //         detail: 'Failed to load events.',
  //       });
  //     }
  //   });
  // }

  private closeDialog(): void {
    this.visibleDialogForm = false;
    this.selectedEvent = null;
    this.form.reset();
    this.initForm();
  }

  isAdmin(): boolean {
    return this.authService.userHasRole(UserRole.Admin);
  }

  toggleRegistration(event: any): void {
    if (!this.currentUser) return;

    if (event.isRegistered) {
      this.confirmationService.confirm({
        message: `Jeste li sigurni da se želite odjaviti s događaja "${event.name}"?`,
        header: 'Potvrdi odjavu',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Odjavi se',
        rejectLabel: 'Odustani',
        acceptButtonStyleClass: 'p-button-danger',
        rejectButtonStyleClass: 'p-button-secondary',
        accept: () => {
          this.eventService.unregisterFromEvent(event._id, this.currentUser!._id).subscribe({
            next: () => {
              event.isRegistered = false;
              event.registeredUsers = event.registeredUsers.filter(
                (u: CurrentUser) => u._id !== this.currentUser!._id
              );
              this.messageService.add({
                severity: 'info',
                summary: 'Odjava uspješna',
                detail: `Uspješno ste se odjavili s događaja "${event.name}".`,
              });
            },
            error: () => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to unregister from event.',
              });
            }
          });
        }
      });
    } else {
      this.eventService.registerForEvent(event._id, this.currentUser).subscribe({
        next: (updatedEvent: any) => {
          event.isRegistered = true;
          event.registeredUsers = updatedEvent.registeredUsers;
          this.messageService.add({
            severity: 'success',
            summary: 'Prijava uspješna',
            detail: `Uspješno ste se prijavili na događaj "${event.name}".`,
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to register for event.',
          });
        }
      });
    }
  }

  getRegisteredUsers(): CurrentUser[] {
    if (!this.selectedEvent) return [];
    return this.selectedEvent.registeredUsers ?? [];
  }

  removeUserFromEvent(user: CurrentUser): void {
    if (!this.selectedEvent) return;

    this.confirmationService.confirm({
      message: `Jeste li sigurni da želite ukloniti ${user.name} ${user.last_name} s događaja?`,
      header: 'Potvrdi uklanjanje',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Ukloni',
      rejectLabel: 'Odustani',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.eventService.unregisterFromEvent(this.selectedEvent._id, user._id).subscribe({
          next: () => {
            this.selectedEvent.registeredUsers = this.selectedEvent.registeredUsers.filter(
              (u: CurrentUser) => u._id !== user._id
            );
            this.messageService.add({
              severity: 'success',
              summary: 'Uspješno',
              detail: `${user.name} ${user.last_name} je uklonjen/a s događaja.`,
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to remove user from event.',
            });
          }
        });
      }
    });
  }
  loadAllUsers(): void {
    this.userService.getUsers().subscribe({
      next: data => this.allUsers = data || [],
      error: () => { }
    });
  }
  searchUsers(): void {
    const q = this.userSearchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredUsers = [];
      return;
    }
    const alreadyRegistered = this.selectedEvent?.registeredUsers?.map((u: CurrentUser) => u._id) ?? [];
    this.filteredUsers = this.allUsers.filter(u =>
      !alreadyRegistered.includes(u._id) &&
      (`${u.name} ${u.last_name}`).toLowerCase().includes(q)
    );
  }

  selectUserToAdd(user: CurrentUser): void {
    this.selectedUserToAdd = user;
    this.userSearchQuery = `${user.name} ${user.last_name}`;
    this.filteredUsers = [];
  }

  addUserToEvent(): void {
    if (!this.selectedEvent || !this.selectedUserToAdd) return;

    this.eventService.registerForEvent(this.selectedEvent._id, this.selectedUserToAdd).subscribe({
      next: (updatedEvent: any) => {
        this.selectedEvent.registeredUsers = updatedEvent.registeredUsers;
        this.selectedUserToAdd = null;
        this.userSearchQuery = '';
        this.filteredUsers = [];
        this.messageService.add({
          severity: 'success',
          summary: 'Uspješno',
          detail: 'Korisnik je dodan na događaj.',
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Greška',
          detail: 'Nije moguće dodati korisnika.',
        });
      }
    });
  }
}