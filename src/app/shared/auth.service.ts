import { Injectable } from '@angular/core';
import {UserRole} from '../user-role';


export interface CurrentUser {
  _id: string;
  name: string;
  last_name: string;
  email: string;
  role: UserRole;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  /**
   * Check if user has role.
   *
   * @param roleToCheck value of role that has
   * to be checked.
   */
  userHasRole(roleToCheck: UserRole): boolean{
    const raw = localStorage.getItem('currentUser');

    if (!raw) return false;

    const user = JSON.parse(raw);

    return user.role == roleToCheck;
  }

  getUserId() {
    const raw = localStorage.getItem('currentUser');

    if (!raw) return false;

    const user = JSON.parse(raw);

    return user._id;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('currentUser');
  }

  logout(): void {
    localStorage.removeItem('currentUser');
  }

  getCurrentUser(): CurrentUser | null {
    const raw = localStorage.getItem('currentUser');
    if (!raw) return null;
    return JSON.parse(raw) as CurrentUser;
  }
}
