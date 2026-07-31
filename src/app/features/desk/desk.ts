import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslatePipe } from '@ngx-translate/core';
import { LoanService } from '../../core/services/loan.service';

@Component({
  selector: 'app-desk',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, TranslatePipe],
  templateUrl: './desk.html',
  styleUrl: './desk.scss'
})
export class Desk {
  bookId: number | null = null;
  borrowerId: number | null = null;
  returnLoanId: number | null = null;
  busy = signal(false);

  constructor(private readonly loanService: LoanService, private readonly snackBar: MatSnackBar) {}

  issue(): void {
    if (this.bookId === null || this.borrowerId === null) {
      return;
    }
    this.busy.set(true);
    this.loanService.issue(this.bookId, this.borrowerId).subscribe({
      next: (loan) => {
        this.busy.set(false);
        this.snackBar.open(`Issued "${loan.bookTitle}" — due ${loan.dueDate}`, 'OK', { duration: 5000 });
        this.bookId = null;
        this.borrowerId = null;
      },
      error: (err) => {
        this.busy.set(false);
        this.snackBar.open(err?.error?.message ?? 'Could not issue loan', 'OK', { duration: 4000 });
      }
    });
  }

  processReturn(): void {
    if (this.returnLoanId === null) {
      return;
    }
    this.busy.set(true);
    this.loanService.returnLoan(this.returnLoanId).subscribe({
      next: (loan) => {
        this.busy.set(false);
        this.snackBar.open(`Returned "${loan.bookTitle}"`, 'OK', { duration: 4000 });
        this.returnLoanId = null;
      },
      error: (err) => {
        this.busy.set(false);
        this.snackBar.open(err?.error?.message ?? 'Could not process return', 'OK', { duration: 4000 });
      }
    });
  }
}
