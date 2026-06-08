import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { DigitalContentRequestService } from './digital-content-request.service';
import { AuthService } from '../shared/auth.service';
import { UserRole } from '../user-role';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { ButtonDirective } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-digital-content-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, Toast, ButtonDirective, Dialog, ConfirmDialog],
  templateUrl: './digital-content-requests.component.html',
  styleUrl: './digital-content-requests.component.css',
  providers: [MessageService, ConfirmationService]
})
export class DigitalContentRequestsComponent implements OnInit {
  requests: any[] = [];
  currentUser: any = null;
  activeTab: 'aktivni' | 'zavrseni' = 'aktivni';

  visibleStatusDialog = false;
  visibleEditDialog = false;
  selectedRequest: any = null;
  newStatus = '';

  editForm!: FormGroup;

  activeStatuses = ['zaprimljeno', 'u_obradi'];
  finishedStatuses = ['zavrseno', 'odbijeno'];

  statusOptions = [
    { label: 'Zaprimljeno', value: 'zaprimljeno' },
    { label: 'U obradi', value: 'u_obradi' },
    { label: 'Završeno', value: 'zavrseno' },
    { label: 'Odbijeno', value: 'odbijeno' }
  ];

  statusLabels: Record<string, string> = {
    zaprimljeno: 'Zaprimljeno',
    u_obradi: 'U obradi',
    zavrseno: 'Završeno',
    odbijeno: 'Odbijeno'
  };

  statusClasses: Record<string, string> = {
    zaprimljeno: 'status-zaprimljeno',
    u_obradi: 'status-u-obradi',
    zavrseno: 'status-zavrseno',
    odbijeno: 'status-odbijeno'
  };

  constructor(
    private requestService: DigitalContentRequestService,
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {}
  private timer: any;

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadRequests();
    this.initEditForm();
  
    this.timer = setInterval(() => {
      this.cdr.detectChanges();
    }, 10000); // osvježava svake 10 sekundi
  }
  
  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }


  private initEditForm(): void {
    this.editForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      author: new FormControl('', [Validators.required]),
      description: new FormControl('', [Validators.required]),
      impairment: new FormControl('', [Validators.required]),
    });
  }

  private loadRequests(): void {
    if (this.isAdmin()) {
      this.requestService.getAll().subscribe({
        next: data => this.requests = data || [],
        error: () => this.showError()
      });
    } else {
      this.requestService.getByUser(this.currentUser._id).subscribe({
        next: data => this.requests = data || [],
        error: () => this.showError()
      });
    }
  }

  get activeRequests(): any[] {
    return this.requests.filter(r => this.activeStatuses.includes(r.status));
  }

  get finishedRequests(): any[] {
    return this.requests.filter(r => this.finishedStatuses.includes(r.status));
  }

  get currentRequests(): any[] {
    return this.activeTab === 'aktivni' ? this.activeRequests : this.finishedRequests;
  }

  setTab(tab: 'aktivni' | 'zavrseni'): void {
    this.activeTab = tab;
  }

  // Provjera je li unutar 30 minuta od kreiranja
  canEdit(req: any): boolean {
    if (this.isAdmin()) return false;
    const created = new Date(req.createdAt).getTime();
    const now = Date.now();
    return now - created <= 30 * 60 * 1000;
  }

  openEditDialog(req: any): void {
    this.selectedRequest = req;
    this.editForm.patchValue({
      title: req.title,
      author: req.author,
      description: req.description,
      impairment: req.impairment,
    });
    this.visibleEditDialog = true;
  }

  saveEdit(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.requestService.update(this.selectedRequest._id, this.editForm.value).subscribe({
      next: (updated: any) => {
        const index = this.requests.findIndex(r => r._id === updated._id);
        if (index !== -1) this.requests[index] = { ...this.requests[index], ...updated };
        this.visibleEditDialog = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Uspješno',
          detail: 'Zahtjev je ažuriran.'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Greška',
          detail: 'Ažuriranje zahtjeva nije uspjelo.'
        });
      }
    });
  }

  confirmDelete(req: any): void {
    this.confirmationService.confirm({
      message: `Jeste li sigurni da želite obrisati zahtjev "${req.title}"?`,
      header: 'Potvrdi brisanje',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Obriši',
      rejectLabel: 'Odustani',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.requestService.delete(req._id).subscribe({
          next: () => {
            this.requests = this.requests.filter(r => r._id !== req._id);
            this.messageService.add({
              severity: 'success',
              summary: 'Uspješno',
              detail: 'Zahtjev je obrisan.'
            });
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Greška',
              detail: 'Brisanje zahtjeva nije uspjelo.'
            });
          }
        });
      }
    });
  }

  openStatusDialog(req: any): void {
    this.selectedRequest = req;
    this.newStatus = req.status;
    this.visibleStatusDialog = true;
  }

  saveStatus(): void {
    if (!this.selectedRequest) return;

    this.requestService.update(this.selectedRequest._id, { status: this.newStatus }).subscribe({
      next: (updated: any) => {
        const index = this.requests.findIndex(r => r._id === updated._id);
        if (index !== -1) this.requests[index] = updated;
        this.visibleStatusDialog = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Uspješno',
          detail: 'Status zahtjeva je ažuriran.'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Greška',
          detail: 'Ažuriranje statusa nije uspjelo.'
        });
      }
    });
  }

  private showError(): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Greška',
      detail: 'Učitavanje zahtjeva nije uspjelo.'
    });
  }

  isAdmin(): boolean {
    return this.authService.userHasRole(UserRole.Admin);
  }

  getStatusLabel(status: string): string {
    return this.statusLabels[status] ?? status;
  }

  getStatusClass(status: string): string {
    return this.statusClasses[status] ?? '';
  }
}