import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Role, User } from '../models/user.model';

export interface CreateUserRequest {
  matricule: string;
  fullName: string;
  email?: string;
  phone?: string;
  password: string;
  role: Role;
  department?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly baseUrl = `${environment.apiBaseUrl}/users`;

  constructor(private readonly http: HttpClient) {}

  listAll(): Observable<User[]> {
    return this.http.get<User[]>(this.baseUrl);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  create(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.baseUrl, request);
  }
}
