import { HomepageComponent } from './homepage/homepage.component';
import { EventsComponent } from './events/events.component';
import { UsersComponent } from './users/users.component';
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { DigitalContentComponent } from './digital-content/digital-content.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },

  { path: 'home', component: HomepageComponent, canActivate: [authGuard] },
  { path: 'users', component: UsersComponent, canActivate: [authGuard] },
  { path: 'events', component: EventsComponent, canActivate: [authGuard] },
  { path: 'digital-content', component: DigitalContentComponent, canActivate: [authGuard] },

  { path: '**', redirectTo: 'login' }
];
