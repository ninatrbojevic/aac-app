import { Component, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../users/users.service';
import { EventService } from '../events/events.service';
import { DigitalContentService } from '../digital-content/digital-content.service';
import {AuthService} from '../shared/auth.service';
import {UserRole} from '../user-role';
import { DigitalContentRequestService } from '../digital-content-requests/digital-content-request.service';

@Component({
  selector: 'app-homepage',
  imports: [CardModule, ButtonModule, RippleModule, CommonModule],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent implements OnInit {
  eventCount: number | null = null;
  userCount: number | null = null;
  contentCount: number | null = null;
  requestCount: number | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userService: UserService,
    private eventService: EventService,
    private digitalContentService: DigitalContentService,
    private requestService: DigitalContentRequestService
  ) { }

  isAdmin(): boolean {
    return this.authService.userHasRole(UserRole.Admin);
  }

  ngOnInit() {
    this.eventService.getEvents().subscribe(events => this.eventCount = events.length);
    this.digitalContentService.getAll().subscribe(items => this.contentCount = items.length);
  
    if (this.isAdmin()) {
      this.userService.getUsers().subscribe(users => this.userCount = users.length);
      this.requestService.getAll().subscribe(requests => this.requestCount = requests.length);
    } else {
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        this.requestService.getByUser(currentUser._id).subscribe(
          requests => this.requestCount = requests.length
        );
      }
    }
  }

  goTo(route: string) {
    this.router.navigate([route]);
  }
}
