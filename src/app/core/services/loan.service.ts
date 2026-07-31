import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Loan } from '../models/loan.model';

@Injectable({ providedIn: 'root' })
export class LoanService {
  private readonly baseUrl = `${environment.apiBaseUrl}/loans`;

  constructor(private readonly http: HttpClient) {}

  myLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.baseUrl}/my`);
  }

  loansForUser(userId: number): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.baseUrl}/user/${userId}`);
  }

  issue(bookId: number, borrowerId: number): Observable<Loan> {
    return this.http.post<Loan>(this.baseUrl, { bookId, borrowerId });
  }

  returnLoan(loanId: number): Observable<Loan> {
    return this.http.post<Loan>(`${this.baseUrl}/${loanId}/return`, {});
  }

  renew(loanId: number): Observable<Loan> {
    return this.http.post<Loan>(`${this.baseUrl}/${loanId}/renew`, {});
  }
}
