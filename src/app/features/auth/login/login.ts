import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    TranslatePipe
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  matricule = '';
  password = '';
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  passwordVisible = signal(false);

  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  togglePasswordVisibility(): void {
    this.passwordVisible.update((visible) => !visible);
  }

  submit(): void {
    this.errorMessage.set(null);
    this.loading.set(true);
    this.authService.login(this.matricule, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('login.error');
      }
    });
  }
}
