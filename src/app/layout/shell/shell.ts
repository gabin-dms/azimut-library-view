import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { Avatar } from '../../shared/avatar/avatar';

interface NavItem {
  path: string;
  icon: string;
  label: string;
  roles?: string[];
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    TranslatePipe,
    Avatar
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.scss'
})
export class Shell {
  readonly navItems: NavItem[] = [
    { path: '/dashboard', icon: 'space_dashboard', label: 'nav.dashboard' },
    { path: '/catalog', icon: 'auto_stories', label: 'nav.catalog' },
    { path: '/my-loans', icon: 'bookmark_border', label: 'nav.myLoans' },
    { path: '/resources', icon: 'folder_open', label: 'nav.resources' },
    { path: '/desk', icon: 'point_of_sale', label: 'nav.desk', roles: ['LIBRARIAN', 'ADMIN'] },
    { path: '/admin/users', icon: 'group', label: 'nav.admin', roles: ['ADMIN'] }
  ];

  searchQuery = '';

  constructor(
    readonly authService: AuthService,
    private readonly translate: TranslateService,
    private readonly router: Router
  ) {}

  visibleNavItems(): NavItem[] {
    return this.navItems.filter((item) => !item.roles || this.authService.hasAnyRole(...item.roles));
  }

  searchCatalog(): void {
    this.router.navigate(['/catalog'], { queryParams: { query: this.searchQuery || null } });
  }

  useLanguage(lang: 'en' | 'fr'): void {
    this.translate.use(lang).subscribe();
    localStorage.setItem('library_lang', lang);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
