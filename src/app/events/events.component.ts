import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { EventService } from './events.service';
import { ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Checkbox } from 'primeng/checkbox';


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
    FormsModule,
    ReactiveFormsModule,
    ConfirmDialog,
    Checkbox
  ],
})
export class EventsComponent implements OnInit {
  events: any[] = [];

  visibleDialogForm = false;

  form!: FormGroup;

  selectedEvent: any | null = null;

  constructor(
    private eventService: EventService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadEvents();
  }


  private initForm() {
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


  showCreateDialog() {
    this.selectedEvent = null;
    this.form.reset();
    this.visibleDialogForm = true;
  }
  openUpdateDialog(event: any) {
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

    if (this.selectedEvent) {
      this.updateEvent();
    } else {
      this.createEvent();
    }
  }

  private createEvent() {
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
        console.log('CREATE ERROR:', err);

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to create event.',
        });
      }
    });
  }


  private updateEvent() {
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
        console.log('UPDATE ERROR:', err);

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update event.',
        });
      }
    });
  }

  confirmDelete(event: any) {
    this.confirmationService.confirm({
      message: `Jeste li sigurni da želite obrisati događaj: ${event.name}?`,
      header: 'Potvrdi',
      icon: 'pi pi-exclamation-triangle',

      acceptLabel: 'Obriši',
      rejectLabel: 'Otkaži',

      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-secondary',

      accept: () => {
        this.deleteEvent(event._id);
      }
    });
  }

  private deleteEvent(id: string) {
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


  private loadEvents() {
    this.eventService.getEvents().subscribe({
      next: data => {
        this.events = data || [];
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

  expandedEventId: string | null = null;

  toggleExpand(event: any) {
    if (this.expandedEventId === event._id) {
      this.expandedEventId = null;
    } else {
      this.expandedEventId = event._id;
    }
  }
  private closeDialog() {
    this.visibleDialogForm = false;
    this.selectedEvent = null;
    this.form.reset();
    this.initForm();
  }
}