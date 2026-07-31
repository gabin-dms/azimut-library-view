import { Component, effect, input, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';

/** Renders the current user's avatar image, falling back to initials when none is set.
 *  Only supports "self" — there is no per-user avatar-viewing endpoint (see ProfileController) —
 *  which is all the app needs today (topbar chip + profile page). */
@Component({
  selector: 'app-avatar',
  standalone: true,
  template: `
    @if (avatarUrl()) {
      <img [src]="avatarUrl()" class="avatar-img" [style.width.px]="size()" [style.height.px]="size()" alt="" />
    } @else {
      <span class="avatar-initials" [style.width.px]="size()" [style.height.px]="size()">{{ initials() }}</span>
    }
  `,
  styles: [
    `
      .avatar-img {
        border-radius: 50%;
        object-fit: cover;
        display: block;
      }

      .avatar-initials {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: var(--brand-primary);
        color: white;
        font-weight: 700;
        font-size: 0.8rem;
      }
    `
  ]
})
export class Avatar {
  size = input(34);

  avatarUrl = signal<string | null>(null);

  constructor(
    private readonly authService: AuthService,
    private readonly profileService: ProfileService
  ) {
    effect((onCleanup) => {
      const user = this.authService.currentUser();
      let objectUrl: string | null = null;

      if (user?.hasAvatar) {
        this.profileService.getAvatarBlob().subscribe((blob) => {
          objectUrl = URL.createObjectURL(blob);
          this.avatarUrl.set(objectUrl);
        });
      } else {
        this.avatarUrl.set(null);
      }

      onCleanup(() => {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      });
    });
  }

  initials(): string {
    const name = this.authService.currentUser()?.fullName ?? '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }
}
