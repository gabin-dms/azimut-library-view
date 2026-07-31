export interface Book {
  id: number;
  isbn: string | null;
  title: string;
  authors: string;
  publisher: string | null;
  publicationYear: number | null;
  categoryName: string | null;
  language: string;
  description: string | null;
  coverUrl: string | null;
  availableCopies: number;
  totalCopies: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
