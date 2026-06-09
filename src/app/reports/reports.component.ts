import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EventService } from '../events/events.service';
import { DigitalContentService } from '../digital-content/digital-content.service';
import { DigitalContentRequestService } from '../digital-content-requests/digital-content-request.service';
import { ChartModule } from 'primeng/chart';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, ChartModule, Toast],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css',
  providers: [MessageService]
})
export class ReportsComponent implements OnInit {
  activeTab: 'events' | 'content' = 'events';

  // Filteri
  dateFrom: string = '';
  dateTo: string = '';

  // Podaci
  allEvents: any[] = [];
  allContents: any[] = [];
  allRequests: any[] = [];

  // Filtrirani podaci
  filteredEvents: any[] = [];
  filteredContents: any[] = [];
  filteredRequests: any[] = [];

  // Odabrani pojedinačni događaj
  selectedEventId: string = '';
  selectedEventDetail: any = null;

  // Chart data
  eventChartData: any = null;
  eventChartOptions: any = null;
  requestChartData: any = null;
  requestChartOptions: any = null;

  constructor(
    private eventService: EventService,
    private contentService: DigitalContentService,
    private requestService: DigitalContentRequestService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.setDefaultDateRange();
    this.loadAll();
  }

  private setDefaultDateRange(): void {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    this.dateFrom = firstDay.toISOString().split('T')[0];
    this.dateTo = now.toISOString().split('T')[0];
  }

  private loadAll(): void {
    this.eventService.getEvents().subscribe({
      next: data => {
        this.allEvents = data || [];
        this.applyEventFilter();
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Greška', detail: 'Greška pri dohvatu događaja.' })
    });

    this.contentService.getAll().subscribe({
      next: data => {
        this.allContents = data || [];
        this.applyContentFilter();
      },
      error: () => {}
    });

    this.requestService.getAll().subscribe({
      next: data => {
        this.allRequests = data || [];
        this.applyContentFilter();
      },
      error: () => {}
    });
  }

  applyFilter(): void {
    this.applyEventFilter();
    this.applyContentFilter();
    this.selectedEventId = '';
    this.selectedEventDetail = null;
  }

  private applyEventFilter(): void {
    const from = this.dateFrom ? new Date(this.dateFrom + 'T00:00:00') : null;
    const to = this.dateTo ? new Date(this.dateTo + 'T23:59:59') : null;
  
    this.filteredEvents = this.allEvents.filter(e => {
      const d = new Date(e.createdAt); // ← umjesto e.date
      if (isNaN(d.getTime())) return true;
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  
    this.buildEventChart();
  }

  private applyContentFilter(): void {
    const from = this.dateFrom ? new Date(this.dateFrom) : null;
    const to = this.dateTo ? new Date(this.dateTo + 'T23:59:59') : null;

    this.filteredContents = this.allContents.filter(c => {
      const d = new Date(c.createdAt);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });

    this.filteredRequests = this.allRequests.filter(r => {
      const d = new Date(r.createdAt);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });

    this.buildRequestChart();
  }

  onEventSelect(): void {
    if (!this.selectedEventId) {
      this.selectedEventDetail = null;
      return;
    }
    this.selectedEventDetail = this.allEvents.find(e => e._id === this.selectedEventId) ?? null;
  }

  private buildEventChart(): void {
    const labels = this.filteredEvents.map(e => e.name);
    const data = this.filteredEvents.map(e => e.registeredUsers?.length ?? 0);

    this.eventChartData = {
      labels,
      datasets: [{
        label: 'Broj sudionika',
        data,
        backgroundColor: '#6d92bc',
        borderColor: '#253b5d',
        borderWidth: 1,
        borderRadius: 6,
      }]
    };

    this.eventChartOptions = {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
    };
  }

  private buildRequestChart(): void {
    const statusMap: Record<string, number> = {};
    this.filteredRequests.forEach(r => {
      const s = r.status ?? 'nepoznato';
      statusMap[s] = (statusMap[s] ?? 0) + 1;
    });

    this.requestChartData = {
      labels: Object.keys(statusMap),
      datasets: [{
        data: Object.values(statusMap),
        backgroundColor: ['#253b5d', '#6d92bc', '#a8c4e0', '#d1e3f3', '#f0f4f8'],
        borderWidth: 0
      }]
    };

    this.requestChartOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'bottom' }
      }
    };
  }

  get totalParticipants(): number {
    return this.filteredEvents.reduce((sum, e) => sum + (e.registeredUsers?.length ?? 0), 0);
  }

  get requestStatusGroups(): { status: string; count: number }[] {
    const map: Record<string, number> = {};
    this.filteredRequests.forEach(r => {
      const s = r.status ?? 'nepoznato';
      map[s] = (map[s] ?? 0) + 1;
    });
    return Object.entries(map).map(([status, count]) => ({ status, count }));
  }
  get finishedEventsCount(): number {
    return this.filteredEvents.filter(e => e.status === 'finished').length;
  }
}