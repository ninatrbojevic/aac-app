import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { CurrentUser } from '../shared/auth.service';


@Injectable({
  providedIn: 'root'
})
export class EventService {

  constructor(private http: HttpClient) {
  }

  apiUrl = 'http://localhost:3000/api/events/';

  getEvents = () =>
    this.http.get<any[]>(this.apiUrl);

  getEvent = (eventId: string) =>
    this.http.get(this.apiUrl + eventId);

  createEvent = (request: any) =>
    this.http.post(this.apiUrl, request);

  updateEvent = (eventId: string, request: any) =>
    this.http.put(this.apiUrl + eventId, request);

  deleteEvent = (eventId: string) =>
    this.http.delete(this.apiUrl + eventId);

  registerForEvent = (eventId: string, user: CurrentUser) =>
  this.http.post(`${this.apiUrl}${eventId}/register`, user);

  unregisterFromEvent = (eventId: string, userId: string) =>
  this.http.delete(`${this.apiUrl}${eventId}/register/${userId}`);

}