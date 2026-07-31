import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { ResourceService } from '../../core/services/resource.service';
import { ResourceCategory, ResourceType, TeachingResource } from '../../core/models/resource.model';

const TYPE_ICONS: Record<ResourceType, string> = {
  QUIZ: 'quiz',
  NOTES: 'sticky_note_2',
  DOCUMENT: 'description',
  VIDEO: 'movie'
};

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule, TranslatePipe],
  templateUrl: './resources.html',
  styleUrl: './resources.scss'
})
export class Resources implements OnInit {
  resources = signal<TeachingResource[]>([]);
  categories = signal<ResourceCategory[]>([]);
  loading = signal(false);
  uploading = signal(false);

  readonly resourceTypes: ResourceType[] = ['QUIZ', 'NOTES', 'DOCUMENT', 'VIDEO'];

  filterCategoryId: number | null = null;
  filterType: ResourceType | null = null;

  uploadTitle = '';
  uploadDescription = '';
  uploadType: ResourceType = 'DOCUMENT';
  uploadCategoryId: number | null = null;
  uploadFile: File | null = null;
  newCategoryName = '';

  constructor(
    private readonly resourceService: ResourceService,
    private readonly snackBar: MatSnackBar,
    readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadResources();
  }

  canManage(): boolean {
    return this.authService.hasAnyRole('LECTURER', 'ADMIN');
  }

  canDelete(resource: TeachingResource): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;
    return user.role === 'ADMIN' || (user.role === 'LECTURER' && resource.uploadedById === user.id);
  }

  typeIcon(type: ResourceType): string {
    return TYPE_ICONS[type];
  }

  loadCategories(): void {
    this.resourceService.listCategories().subscribe((categories) => this.categories.set(categories));
  }

  loadResources(): void {
    this.loading.set(true);
    this.resourceService.list(this.filterCategoryId ?? undefined, this.filterType ?? undefined).subscribe({
      next: (resources) => {
        this.resources.set(resources);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.uploadFile = input.files?.[0] ?? null;
  }

  addCategory(): void {
    const name = this.newCategoryName.trim();
    if (!name) return;
    this.resourceService.createCategory(name).subscribe({
      next: (category) => {
        this.categories.update((current) => [...current, category]);
        this.uploadCategoryId = category.id;
        this.newCategoryName = '';
      },
      error: (err) => this.snackBar.open(err?.error?.message ?? 'Could not create category', 'OK', { duration: 4000 })
    });
  }

  upload(): void {
    if (!this.uploadFile || !this.uploadTitle || !this.uploadCategoryId) {
      this.snackBar.open('Title, category and a file are required', 'OK', { duration: 4000 });
      return;
    }
    this.uploading.set(true);
    this.resourceService
      .upload({
        file: this.uploadFile,
        title: this.uploadTitle,
        description: this.uploadDescription || undefined,
        type: this.uploadType,
        categoryId: this.uploadCategoryId
      })
      .subscribe({
        next: () => {
          this.uploading.set(false);
          this.snackBar.open('Resource uploaded', 'OK', { duration: 3000 });
          this.uploadTitle = '';
          this.uploadDescription = '';
          this.uploadFile = null;
          this.loadResources();
        },
        error: (err) => {
          this.uploading.set(false);
          this.snackBar.open(err?.error?.message ?? 'Upload failed', 'OK', { duration: 4000 });
        }
      });
  }

  download(resource: TeachingResource): void {
    this.resourceService.download(resource.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = resource.originalFilename;
        anchor.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('Could not download this resource', 'OK', { duration: 4000 })
    });
  }

  remove(resource: TeachingResource): void {
    this.resourceService.delete(resource.id).subscribe({
      next: () => {
        this.snackBar.open('Resource removed', 'OK', { duration: 3000 });
        this.loadResources();
      },
      error: (err) => this.snackBar.open(err?.error?.message ?? 'Could not remove resource', 'OK', { duration: 4000 })
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
