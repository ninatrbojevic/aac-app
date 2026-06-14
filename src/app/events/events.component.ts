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

  collaboratorSearchQuery = '';
  filteredCollaborators: CurrentUser[] = [];
  selectedCollaboratorToAdd: CurrentUser | null = null;
  pendingCollaborators: CurrentUser[] = [];

  visibleAllergiesDialog = false;
  pendingRegistrationEvent: any = null;
  allergiesInput = '';

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
          status: event.status ?? 'active',
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
    this.pendingCollaborators = [];
    this.collaboratorSearchQuery = '';
    this.form.reset();
    this.loadAllUsers();
    this.visibleDialogForm = true;
  }

  openUpdateDialog(event: any): void {
    this.selectedEvent = event;
    this.pendingCollaborators = event.collaboratorsList ?? [];
    this.collaboratorSearchQuery = '';
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
    this.loadAllUsers();
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
    const payload = {
      ...this.form.value,
      collaboratorsList: this.pendingCollaborators.map(c => ({
        _id: c._id,
        name: c.name,
        last_name: c.last_name
      }))
    };
    this.eventService.createEvent(payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Uspjeh!', detail: 'Događaj je kreiran.' });
        this.closeDialog();
        this.loadEvents();
      },
      error: (err) => {
        console.error('CREATE ERROR:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Kreiranje događaja nije uspjelo.' });
      }
    });
  }

  private updateEvent(): void {
    if (!this.selectedEvent) return;
    const payload = {
      ...this.form.value,
      collaboratorsList: this.pendingCollaborators.map(c => ({
        _id: c._id,
        name: c.name,
        last_name: c.last_name
      }))
    };
    this.eventService.updateEvent(this.selectedEvent._id, payload).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Uspjeh!', detail: 'Događaj je ažuriran.' });
        this.closeDialog();
        this.loadEvents();
      },
      error: (err) => {
        console.error('UPDATE ERROR:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Događaj nije ažuriran.' });
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
          summary: 'Uspjeh!',
          detail: 'Događaj je obrisan.',
        });
        this.loadEvents();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Događaj nije obrisan.',
        });
      }
    });
  }


  private closeDialog(): void {
    this.visibleDialogForm = false;
    this.selectedEvent = null;
    this.pendingCollaborators = [];
    this.collaboratorSearchQuery = '';
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
                detail: `Uspješno ste se odjavili s događaja "${event.name}".`
              });
            },
            error: () => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to unregister from event.' });
            }
          });
        }
      });
    } else {
      if (event.catering) {
        this.pendingRegistrationEvent = event;
        this.allergiesInput = '';
        this.visibleAllergiesDialog = true;
      } else {
        this.registerForEvent(event, '');
      }
    }
  }
  
  confirmRegistrationWithAllergies(): void {
    if (!this.pendingRegistrationEvent) return;
    this.visibleAllergiesDialog = false;
    this.registerForEvent(this.pendingRegistrationEvent, this.allergiesInput);
  }
  
  private registerForEvent(event: any, allergies: string): void {
    if (!this.currentUser) return;
    const payload = {
      ...this.currentUser,
      allergies,
      title: (this.currentUser as any).title || ''
    };
    this.eventService.registerForEvent(event._id, payload).subscribe({
      next: (updatedEvent: any) => {
        event.isRegistered = true;
        event.registeredUsers = updatedEvent.registeredUsers;
        this.allergiesInput = '';
        this.messageService.add({
          severity: 'success',
          summary: 'Prijava uspješna',
          detail: `Uspješno ste se prijavili na događaj "${event.name}".`
        });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to register for event.' });
      }
    });
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
  confirmEvent(event: any): void {
    if (!event.registeredUsers || event.registeredUsers.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Upozorenje',
        detail: 'Nema prijavljenih korisnika za ovaj događaj.'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Želite li poslati potvrde svim prijavljenim korisnicima za događaj "${event.name}"?`,
      header: 'Potvrdi slanje',
      icon: 'pi pi-envelope',
      acceptLabel: 'Pošalji',
      rejectLabel: 'Odustani',
      accept: () => {
        this.eventService.confirmEvent(event._id).subscribe({
          next: () => {
            event.status = 'finished'; // lokalno ažuriranje
            this.visibleRegisteredDialog = false;
            this.messageService.add({
              severity: 'success',
              summary: 'Uspješno',
              detail: 'Potvrde su poslane svim prijavljenim korisnicima.'
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Greška',
              detail: 'Slanje potvrda nije uspjelo.'
            });
          }
        });
      }
    });
  }

  activeTab: 'active' | 'finished' = 'active';

  get tabbedEvents(): any[] {
    return this.filteredEvents.filter(e =>
      this.activeTab === 'finished'
        ? e.status === 'finished'
        : e.status !== 'finished'
    );
  }
  get activeCount(): number {
    return this.events.filter(e => e.status !== 'finished').length;
  }

  get finishedCount(): number {
    return this.events.filter(e => e.status === 'finished').length;
  }

  searchCollaborators(): void {
    const q = this.collaboratorSearchQuery.toLowerCase().trim();
    if (!q) {
      this.filteredCollaborators = [];
      return;
    }
    const alreadyAdded = this.pendingCollaborators.map(c => c._id);
    this.filteredCollaborators = this.allUsers.filter(u =>
      !alreadyAdded.includes(u._id) &&
      (`${u.name} ${u.last_name}`).toLowerCase().includes(q)
    );
  }

  selectCollaborator(user: CurrentUser): void {
    this.selectedCollaboratorToAdd = user;
    this.collaboratorSearchQuery = `${user.name} ${user.last_name}`;
    this.filteredCollaborators = [];
  }

  addCollaboratorToForm(): void {
    if (!this.selectedCollaboratorToAdd) return;
    this.pendingCollaborators.push(this.selectedCollaboratorToAdd);
    this.selectedCollaboratorToAdd = null;
    this.collaboratorSearchQuery = '';
    this.filteredCollaborators = [];
  }

  removeCollaboratorFromForm(user: CurrentUser): void {
    this.pendingCollaborators = this.pendingCollaborators.filter(c => c._id !== user._id);
  }
}