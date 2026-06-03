import { Injectable } from '@angular/core';
import {UserRole} from '../user-role';

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
}
