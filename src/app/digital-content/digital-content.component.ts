import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ButtonDirective} from 'primeng/button';
import {Dialog} from 'primeng/dialog';
import {InputText} from 'primeng/inputtext';
import {IconField} from 'primeng/iconfield';
import {InputIcon} from 'primeng/inputicon';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ConfirmationService, MessageService} from 'primeng/api';
import {ConfirmDialog} from 'primeng/confirmdialog';
import {DigitalContentService} from './digital-content.service';
import {Select} from 'primeng/select';
import {Toast} from 'primeng/toast';
import {AuthService} from '../shared/auth.service';
import {UserRole} from '../user-role';
import {DigitalContentRequestService} from '../digital-content-requests/digital-content-request.service';

@Component({
  selector: 'app-digital-content',
  templateUrl: './digital-content.component.html',
  styleUrl: './digital-content.component.css',
  standalone: true,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    ButtonDirective,
    Dialog,
    InputText,
    FormsModule,
    ReactiveFormsModule,
    ConfirmDialog,
    Select,
    Toast,
    IconField,
    InputIcon,
  ],
})
export class DigitalContentComponent implements OnInit {
  digitalContentItems: any[] = [];
  contentSearchQuery = '';

  get filteredDigitalContentItems(): any[] {
    const q = this.contentSearchQuery.toLowerCase().trim();
    if (!q) return this.digitalContentItems;
    return this.digitalContentItems.filter(i =>
      i.title?.toLowerCase().includes(q) ||
      i.author?.toLowerCase().includes(q)
    );
  }

  visibleDigitalContentDialogForm = false;

  visibleDigitalContentRequestDialogForm = false;

  digitalContentForm!: FormGroup;

  digitalContentRequestForm!: FormGroup;

  selectedDigitalContentItem: any | null = null;

  vrsteOptions = [
    {label: 'Video', value: 'Video'},
    {label: 'Audio', value: 'Audio'},
    {label: 'Dokument', value: 'Dokument'},
    {label: 'Slika', value: 'Slika'},
  ];

  constructor(
    private authService: AuthService,
    private digitalContentService: DigitalContentService,
    private digitalContentRequestService: DigitalContentRequestService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadDigitalContentItems();
  }

  isAdmin(): boolean {
    return this.authService.userHasRole(UserRole.Admin);
  }

  private initForm() {
    this.isAdmin() ? this.initDigitalContentForm() :
      this.initDigitalContentRequestForm();
  }

  private initDigitalContentForm(): void {
    this.digitalContentForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      type: new FormControl('', [Validators.required]),
      author: new FormControl('', [Validators.required]),
      url: new FormControl('', [Validators.required])
    });
  }

  private initDigitalContentRequestForm(): void {
    this.digitalContentRequestForm = new FormGroup({
      description: new FormControl('', [Validators.required]),
      title: new FormControl('', [Validators.required]),
      author: new FormControl('', [Validators.required]),
      impairment: new FormControl('', [Validators.required]),
      user_id: new FormControl(this.authService.getUserId(), [Validators.required])
    });
  }

  showDigitalContentCreateDialog() {
    this.selectedDigitalContentItem = null;
    this.digitalContentForm.reset();
    this.visibleDigitalContentDialogForm = true;
  }

  showRequestCreateDialog() {
    this.digitalContentRequestForm.reset();
    this.digitalContentRequestForm.patchValue({ user_id: this.authService.getUserId() });
    this.visibleDigitalContentRequestDialogForm = true;
  }

  openDigitalContentUpdateDialog(item: any) {
    this.selectedDigitalContentItem = item;
    this.digitalContentForm.reset();
    this.digitalContentForm.patchValue({
      title: item.title,
      type: item.type,
      author: item.author,
      url: item.url,
    });
    this.visibleDigitalContentDialogForm = true;
  }

  submitDigitalContentForm() {
    if (this.digitalContentForm.invalid) {
      this.digitalContentForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Nepotpuni podaci',
        detail: 'Provjerite polja formulara.',
      });
      return;
    }

    if (this.selectedDigitalContentItem) {
      this.updateDigitalContentItem();
    } else {
      this.createDigitalContentItem();
    }
  }

  submitDigitalContentRequestForm() {
    if (this.digitalContentRequestForm.invalid) {
      Object.entries(this.digitalContentRequestForm.controls).forEach(([name, control]) => {
        if (control.invalid) console.log('Invalid control:', name, control.errors);
      });
      this.digitalContentRequestForm.markAllAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Nepotpuni podaci',
        detail: 'Provjerite polja formulara.',
      });
      return;
    } else {
      this.createDigitalContentRequestItem();
    }
  }

  private createDigitalContentRequestItem() {
    this.digitalContentRequestService.create(this.digitalContentRequestForm.value).subscribe({
      next: () => {
        this.messageService.add({severity: 'success', summary: 'Uspješno', detail: 'Sadržaj kreiran.'});
        this.closeDialog();
      },
      error: () => {
        this.messageService.add({severity: 'error', summary: 'Greška', detail: 'Kreiranje nije uspjelo.'});
      }
    });
  }

  private createDigitalContentItem() {
    this.digitalContentService.create(this.digitalContentForm.value).subscribe({
      next: () => {
        this.messageService.add({severity: 'success', summary: 'Uspješno', detail: 'Sadržaj kreiran.'});
        this.closeDialog();
        this.loadDigitalContentItems();
      },
      error: () => {
        this.messageService.add({severity: 'error', summary: 'Greška', detail: 'Kreiranje nije uspjelo.'});
      }
    });
  }

  private updateDigitalContentItem() {
    this.digitalContentService.update(this.selectedDigitalContentItem._id, this.digitalContentForm.value).subscribe({
      next: () => {
        this.messageService.add({severity: 'success', summary: 'Uspješno', detail: 'Sadržaj ažuriran.'});
        this.closeDialog();
        this.loadDigitalContentItems();
      },
      error: () => {
        this.messageService.add({severity: 'error', summary: 'Greška', detail: 'Ažuriranje nije uspjelo.'});
      }
    });
  }

  confirmDelete(item: any) {
    this.confirmationService.confirm({
      message: `Jeste li sigurni da želite obrisati sadržaj: ${item.title}?`,
      header: 'Potvrdi',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Obriši',
      rejectLabel: 'Odustani',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.deleteItem(item._id);
      }
    });
  }

  private deleteItem(id: string) {
    this.digitalContentService.delete(id).subscribe({
      next: () => {
        this.messageService.add({severity: 'success', summary: 'Uspješno', detail: 'Sadržaj obrisan.'});
        this.loadDigitalContentItems();
      },
      error: () => {
        this.messageService.add({severity: 'error', summary: 'Greška', detail: 'Brisanje nije uspjelo.'});
      }
    });
  }

  private loadDigitalContentItems() {
    this.digitalContentService.getAll().subscribe({
      next: data => {
        this.digitalContentItems = data || [];
      },
      error: () => {
        this.messageService.add({severity: 'error', summary: 'Greška', detail: 'Učitavanje nije uspjelo.'});
      }
    });
  }

  private closeDialog() {
    this.visibleDigitalContentDialogForm = false;
    this.visibleDigitalContentRequestDialogForm = false;
    this.selectedDigitalContentItem = null;
    this.digitalContentForm?.reset();
    this.initForm();
  }

  vrstaIcon(type: string): string {
    const icons: Record<string, string> = {
      Video: 'pi pi-video',
      Audio: 'pi pi-volume-up',
      Dokument: 'pi pi-file-pdf',
      Slika: 'pi pi-image',
    };
    return icons[type] ?? 'pi pi-folder';
  }
}
