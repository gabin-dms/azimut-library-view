import { Component, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { TranslatePipe } from '@ngx-translate/core';
import { LoanService } from '../../core/services/loan.service';
import { FineService } from '../../core/services/fine.service';
import { ReservationService } from '../../core/services/reservation.service';
import { Loan, Fine, Reservation } from '../../core/models/loan.model';

@Component({
  selector: 'app-my-loans',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTableModule, TranslatePipe],
  templateUrl: './my-loans.html',
  styleUrl: './my-loans.scss'
})
export class MyLoans implements OnInit {
  loans = signal<Loan[]>([]);
  fines = signal<Fine[]>([]);
  reservations = signal<Reservation[]>([]);
  loanColumns = ['bookTitle', 'borrowDate', 'dueDate', 'status', 'actions'];

  constructor(
    private readonly loanService: LoanService,
    private readonly fineService: FineService,
    private readonly reservationService: ReservationService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loanService.myLoans().subscribe((loans) => this.loans.set(loans));
    this.fineService.myUnpaidFines().subscribe((fines) => this.fines.set(fines));
    this.reservationService.myReservations().subscribe((reservations) => this.reservations.set(reservations));
  }

  renew(loan: Loan): void {
    this.loanService.renew(loan.id).subscribe({
      next: () => {
        this.snackBar.open('Loan renewed', 'OK', { duration: 3000 });
        this.refresh();
      },
      error: (err) => this.snackBar.open(err?.error?.message ?? 'Could not renew this loan', 'OK', { duration: 4000 })
    });
  }

  cancelReservation(reservation: Reservation): void {
    this.reservationService.cancel(reservation.id).subscribe(() => this.refresh());
  }
}
