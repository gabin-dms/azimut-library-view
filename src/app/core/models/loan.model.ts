export type LoanStatus = 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'LOST';

export interface Loan {
  id: number;
  bookId: number;
  bookTitle: string;
  inventoryCode: string;
  borrowerId: number;
  borrowerName: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string | null;
  status: LoanStatus;
  renewalCount: number;
}

export type ReservationStatus = 'PENDING' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';

export interface Reservation {
  id: number;
  bookId: number;
  bookTitle: string;
  status: ReservationStatus;
  reservedAt: string;
  expiresAt: string | null;
}

export interface Fine {
  id: number;
  loanId: number;
  amountXaf: number;
  reason: string;
  paid: boolean;
  paidAt: string | null;
}
