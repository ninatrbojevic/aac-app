import { UsersComponent } from './users/users.component';
import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent} from './registration/registration.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegistrationComponent },
  { path: 'users', component: UsersComponent },
];
