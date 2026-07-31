import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { AuthService } from '../../core/services/auth.service';
import { CatalogService } from '../../core/services/catalog.service';
import { LoanService } from '../../core/services/loan.service';
import { FineService } from '../../core/services/fine.service';
import { ReservationService } from '../../core/services/reservation.service';
import { Loan, Fine, Reservation, LoanStatus, ReservationStatus } from '../../core/models/loan.model';

interface QuickLink {
  path: string;
  icon: string;
  label: string;
  roles?: string[];
}

const CHART_COLORS = ['#7c6df0', '#8b7ff0', '#a89bf5', '#c3baf9', '#54c98a', '#f2b84b', '#e8685f'];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, TranslatePipe, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  totalBooks = signal<number | null>(null);
  activeLoans = signal<number | null>(null);
  unpaidFines = signal<number | null>(null);
  pendingReservations = signal<number | null>(null);

  readonly quickLinks: QuickLink[] = [
    { path: '/catalog', icon: 'auto_stories', label: 'nav.catalog' },
    { path: '/my-loans', icon: 'bookmark_border', label: 'nav.myLoans' },
    { path: '/resources', icon: 'folder_open', label: 'nav.resources' },
    { path: '/desk', icon: 'point_of_sale', label: 'nav.desk', roles: ['LIBRARIAN', 'ADMIN'] },
    { path: '/admin/users', icon: 'group', label: 'nav.admin', roles: ['ADMIN'] }
  ];

  // Books in catalog -> doughnut of books per category
  booksChartType: ChartConfiguration<'doughnut'>['type'] = 'doughnut';
  booksChartData: ChartConfiguration<'doughnut'>['data'] = { labels: [], datasets: [{ data: [] }] };
  readonly booksChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 8, font: { size: 10 } } } }
  };

  // Active loans -> bar of loan status breakdown
  loansChartType: ChartConfiguration<'bar'>['type'] = 'bar';
  loansChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [{ data: [], backgroundColor: CHART_COLORS }] };
  readonly loansChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { display: false }, y: { display: false, beginAtZero: true } }
  };

  // Unpaid fines -> line of fine amounts
  finesChartType: ChartConfiguration<'line'>['type'] = 'line';
  finesChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [{ data: [], borderColor: '#e8685f', backgroundColor: 'rgba(232,104,95,0.15)', fill: true, tension: 0.35, pointRadius: 3 }] };
  readonly finesChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { display: false }, y: { display: false, beginAtZero: true } }
  };

  // Pending reservations -> polar area of reservation status breakdown
  reservationsChartType: ChartConfiguration<'polarArea'>['type'] = 'polarArea';
  reservationsChartData: ChartConfiguration<'polarArea'>['data'] = { labels: [], datasets: [{ data: [] }] };
  readonly reservationsChartOptions: ChartConfiguration<'polarArea'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 8, font: { size: 10 } } } },
    scales: { r: { display: false } }
  };

  constructor(
    readonly authService: AuthService,
    private readonly catalogService: CatalogService,
    private readonly loanService: LoanService,
    private readonly fineService: FineService,
    private readonly reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    this.catalogService.searchBooks('', 0, 1000).subscribe((page) => {
      this.totalBooks.set(page.totalElements);
      this.setBooksChart(page.content.map((book) => book.categoryName ?? 'Uncategorized'));
    });

    this.loanService.myLoans().subscribe((loans) => {
      this.activeLoans.set(loans.filter((loan) => loan.status !== 'RETURNED').length);
      this.setLoansChart(loans);
    });

    this.fineService.myUnpaidFines().subscribe((fines) => {
      this.unpaidFines.set(fines.filter((fine) => !fine.paid).length);
      this.setFinesChart(fines);
    });

    this.reservationService.myReservations().subscribe((reservations) => {
      this.pendingReservations.set(reservations.filter((reservation) => reservation.status === 'PENDING').length);
      this.setReservationsChart(reservations);
    });
  }

  firstName(): string {
    const fullName = this.authService.currentUser()?.fullName ?? '';
    return fullName.split(' ')[0] ?? '';
  }

  visibleQuickLinks(): QuickLink[] {
    return this.quickLinks.filter((link) => !link.roles || this.authService.hasAnyRole(...link.roles));
  }

  private setBooksChart(categoryNames: string[]): void {
    const counts = countBy(categoryNames);
    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
    this.booksChartData = {
      labels: top.map(([name]) => name),
      datasets: [{ data: top.map(([, count]) => count), backgroundColor: CHART_COLORS }]
    };
  }

  private setLoansChart(loans: Loan[]): void {
    const order: LoanStatus[] = ['ACTIVE', 'OVERDUE', 'RETURNED', 'LOST'];
    const counts = countBy(loans.map((loan) => loan.status));
    this.loansChartData = {
      labels: order,
      datasets: [{ data: order.map((status) => counts.get(status) ?? 0), backgroundColor: CHART_COLORS }]
    };
  }

  private setFinesChart(fines: Fine[]): void {
    this.finesChartData = {
      labels: fines.map((fine, index) => `#${index + 1}`),
      datasets: [
        {
          data: fines.map((fine) => fine.amountXaf),
          borderColor: '#e8685f',
          backgroundColor: 'rgba(232,104,95,0.15)',
          fill: true,
          tension: 0.35,
          pointRadius: 3
        }
      ]
    };
  }

  private setReservationsChart(reservations: Reservation[]): void {
    const order: ReservationStatus[] = ['PENDING', 'FULFILLED', 'CANCELLED', 'EXPIRED'];
    const counts = countBy(reservations.map((reservation) => reservation.status));
    this.reservationsChartData = {
      labels: order,
      datasets: [{ data: order.map((status) => counts.get(status) ?? 0), backgroundColor: CHART_COLORS }]
    };
  }
}

function countBy<T extends string>(values: T[]): Map<T, number> {
  const counts = new Map<T, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}
