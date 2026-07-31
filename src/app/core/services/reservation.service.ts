import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Reservation } from '../models/loan.model';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly baseUrl = `${environment.apiBaseUrl}/reservations`;

  constructor(private readonly http: HttpClient) {}

  myReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.baseUrl}/my`);
  }

  reserve(bookId: number): Observable<Reservation> {
    return this.http.post<Reservation>(this.baseUrl, { bookId });
  }

  cancel(reservationId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${reservationId}/cancel`, {});
  }
}
