import { HomepageComponent } from './homepage/homepage.component';
import { EventsComponent } from './events/events.component';
import { UsersComponent } from './users/users.component';
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent} from './registration/registration.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomepageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'users', component: UsersComponent },
  { path: 'events', component: EventsComponent },
];
