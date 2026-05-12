import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) {
  }

  apiUrl = 'http://localhost:3000/api/users/';

  getUsers = () =>
    this.http.get<any[]>(this.apiUrl);

  getUser = (userId: string) =>
    this.http.get(this.apiUrl + userId);

  createUser = (request: any) =>
    this.http.post(this.apiUrl, request);

  updateUser = (userId: string, request: any) =>
    this.http.put(this.apiUrl + userId, request);

  deleteUser = (userId: string) =>
    this.http.delete(this.apiUrl + userId);

}