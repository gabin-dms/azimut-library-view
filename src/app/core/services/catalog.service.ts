import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Book, Page } from '../models/book.model';

export interface CreateBookRequest {
  isbn?: string;
  title: string;
  authors: string;
  publisher?: string;
  publicationYear?: number;
  categoryId?: number;
  language?: string;
  description?: string;
  coverUrl?: string;
  initialCopies: number;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
}

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly baseUrl = `${environment.apiBaseUrl}/catalog`;

  constructor(private readonly http: HttpClient) {}

  searchBooks(query: string, page = 0, size = 20): Observable<Page<Book>> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page)
      .set('size', size);
    return this.http.get<Page<Book>>(`${this.baseUrl}/books`, { params });
  }

  getBook(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.baseUrl}/books/${id}`);
  }

  createBook(request: CreateBookRequest): Observable<Book> {
    return this.http.post<Book>(`${this.baseUrl}/books`, request);
  }

  listCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.baseUrl}/categories`);
  }
}
