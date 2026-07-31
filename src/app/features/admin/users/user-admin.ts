import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { TranslatePipe } from '@ngx-translate/core';
import { CreateUserRequest, UserService } from '../../../core/services/user.service';
import { Role, User } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-admin',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    TranslatePipe
  ],
  templateUrl: './user-admin.html',
  styleUrl: './user-admin.scss'
})
export class UserAdmin implements OnInit {
  users = signal<User[]>([]);
  roles: Role[] = ['STUDENT', 'LECTURER', 'LIBRARIAN', 'ADMIN'];
  columns = ['matricule', 'fullName', 'role', 'status'];

  form: CreateUserRequest = {
    matricule: '',
    fullName: '',
    email: '',
    password: '',
    role: 'STUDENT',
    department: ''
  };

  constructor(private readonly userService: UserService, private readonly snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.userService.listAll().subscribe((users) => this.users.set(users));
  }

  createUser(): void {
    this.userService.create(this.form).subscribe({
      next: () => {
        this.snackBar.open('User created', 'OK', { duration: 3000 });
        this.form = { matricule: '', fullName: '', email: '', password: '', role: 'STUDENT', department: '' };
        this.refresh();
      },
      error: (err) => this.snackBar.open(err?.error?.message ?? 'Could not create user', 'OK', { duration: 4000 })
    });
  }
}
