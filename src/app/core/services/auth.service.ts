import { HttpClient } from '@angular/common/http';
import { Injectable, computed, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

interface LoginResponse {
  token: string;
  user: User;
}

const TOKEN_KEY = 'library_auth_token';
const USER_KEY = 'library_auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSignal = signal<User | null>(this.readStoredUser());
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUserSignal() !== null);

  constructor(private readonly http: HttpClient) {}

  login(matricule: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, { matricule, password })
      .pipe(
        tap((response) => {
          localStorage.setItem(TOKEN_KEY, response.token);
          localStorage.setItem(USER_KEY, JSON.stringify(response.user));
          this.currentUserSignal.set(response.user);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSignal.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /** Call after profile/avatar edits so the shell and any other consumer of
   *  currentUser() reflect the change without a full re-login. */
  updateCurrentUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  hasAnyRole(...roles: string[]): boolean {
    const user = this.currentUserSignal();
    return user !== null && roles.includes(user.role);
  }

  private readStoredUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  }
}
