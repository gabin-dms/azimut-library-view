export type Role = 'STUDENT' | 'LECTURER' | 'LIBRARIAN' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';

export interface User {
  id: number;
  matricule: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: Role;
  department: string | null;
  status: UserStatus;
  hasAvatar: boolean;
}
