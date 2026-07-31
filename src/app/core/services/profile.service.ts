import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

export interface UpdateProfileRequest {
  fullName: string;
  email?: string;
  phone?: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly baseUrl = `${environment.apiBaseUrl}/profile`;

  constructor(private readonly http: HttpClient) {}

  getProfile(): Observable<User> {
    return this.http.get<User>(this.baseUrl);
  }

  updateProfile(request: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(this.baseUrl, request);
  }

  uploadAvatar(file: File): Observable<User> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<User>(`${this.baseUrl}/avatar`, formData);
  }

  removeAvatar(): Observable<User> {
    return this.http.delete<User>(`${this.baseUrl}/avatar`);
  }

  /** Fetched as a blob (not a plain <img src="...">) so the JWT auth header attaches —
   *  the browser's own <img> tag can't carry an Authorization header. */
  getAvatarBlob(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/avatar`, { responseType: 'blob' });
  }
}
