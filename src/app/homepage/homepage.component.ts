import { Component, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../users/users.service';
import { EventService } from '../events/events.service';

@Component({
  selector: 'app-homepage',
  imports: [CardModule, ButtonModule, RippleModule, CommonModule],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent implements OnInit {
  eventCount: number | null = null;
  userCount: number | null = null;

  constructor(
    private router: Router,
    private userService: UserService,
    private eventService: EventService
  ) { }

  ngOnInit() {
    this.eventService.getEvents().subscribe(events => this.eventCount = events.length);
    this.userService.getUsers().subscribe(users => this.userCount = users.length);
  }

  goTo(route: string) {
    this.router.navigate([route]);
  }
}
