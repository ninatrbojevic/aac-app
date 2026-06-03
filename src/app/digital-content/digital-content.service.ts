import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DigitalContentService {

  constructor(private http: HttpClient) {}

  apiUrl = 'http://localhost:3000/api/contents/';

  getAll = () =>
    this.http.get<any[]>(this.apiUrl);

  getOne = (id: string) =>
    this.http.get(this.apiUrl + id);

  create = (request: any) =>
    this.http.post(this.apiUrl, request);

  update = (id: string, request: any) =>
    this.http.put(this.apiUrl + id, request);

  delete = (id: string) =>
    this.http.delete(this.apiUrl + id);
}
