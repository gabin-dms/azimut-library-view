import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslatePipe } from '@ngx-translate/core';
import { CatalogService } from '../../core/services/catalog.service';
import { ReservationService } from '../../core/services/reservation.service';
import { AuthService } from '../../core/services/auth.service';
import { Book } from '../../core/models/book.model';

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  imports: [FormsModule, RouterLink, MatButtonModule, MatIconModule, TranslatePipe],
  templateUrl: './catalog-list.html',
  styleUrl: './catalog-list.scss'
})
export class CatalogList implements OnInit {
  query = '';
  books = signal<Book[]>([]);
  loading = signal(false);

  private readonly gradientCount = 6;

  constructor(
    private readonly catalogService: CatalogService,
    private readonly reservationService: ReservationService,
    private readonly snackBar: MatSnackBar,
    private readonly route: ActivatedRoute,
    readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.query = params.get('query') ?? '';
      this.search();
    });
  }

  firstName(): string {
    const fullName = this.authService.currentUser()?.fullName ?? '';
    return fullName.split(' ')[0] ?? '';
  }

  search(): void {
    this.loading.set(true);
    this.catalogService.searchBooks(this.query).subscribe({
      next: (page) => {
        this.books.set(page.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  coverGradient(book: Book): string {
    const index = (book.id % this.gradientCount) + 1;
    return `var(--cover-gradient-${index})`;
  }

  reserve(book: Book): void {
    this.reservationService.reserve(book.id).subscribe({
      next: () => this.snackBar.open('Reservation placed', 'OK', { duration: 3000 }),
      error: (err) => this.snackBar.open(err?.error?.message ?? 'Could not reserve this book', 'OK', { duration: 4000 })
    });
  }
}
