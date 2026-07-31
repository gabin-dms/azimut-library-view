import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { Avatar } from '../../shared/avatar/avatar';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, TranslatePipe, Avatar],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  user = signal<User | null>(null);
  saving = signal(false);
  uploadingAvatar = signal(false);

  fullName = '';
  email = '';
  phone = '';

  constructor(
    private readonly profileService: ProfileService,
    private readonly authService: AuthService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.profileService.getProfile().subscribe((user) => this.applyUser(user));
  }

  private applyUser(user: User): void {
    this.user.set(user);
    this.fullName = user.fullName;
    this.email = user.email ?? '';
    this.phone = user.phone ?? '';
    this.authService.updateCurrentUser(user);
  }

  save(): void {
    this.saving.set(true);
    this.profileService
      .updateProfile({
        fullName: this.fullName,
        email: this.email || undefined,
        phone: this.phone || undefined
      })
      .subscribe({
        next: (user) => {
          this.saving.set(false);
          this.applyUser(user);
          this.snackBar.open('Profile updated', 'OK', { duration: 3000 });
        },
        error: (err) => {
          this.saving.set(false);
          this.snackBar.open(err?.error?.message ?? 'Could not update profile', 'OK', { duration: 4000 });
        }
      });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploadingAvatar.set(true);
    this.profileService.uploadAvatar(file).subscribe({
      next: (user) => {
        this.uploadingAvatar.set(false);
        this.applyUser(user);
        this.snackBar.open('Avatar updated', 'OK', { duration: 3000 });
      },
      error: (err) => {
        this.uploadingAvatar.set(false);
        this.snackBar.open(err?.error?.message ?? 'Could not upload avatar', 'OK', { duration: 4000 });
      }
    });
    input.value = '';
  }

  removeAvatar(): void {
    this.profileService.removeAvatar().subscribe({
      next: (user) => {
        this.applyUser(user);
        this.snackBar.open('Avatar removed', 'OK', { duration: 3000 });
      },
      error: (err) => this.snackBar.open(err?.error?.message ?? 'Could not remove avatar', 'OK', { duration: 4000 })
    });
  }
}
