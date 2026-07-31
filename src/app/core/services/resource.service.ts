import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ResourceCategory, ResourceType, TeachingResource } from '../models/resource.model';

export interface UploadResourceRequest {
  file: File;
  title: string;
  description?: string;
  type: ResourceType;
  categoryId: number;
}

@Injectable({ providedIn: 'root' })
export class ResourceService {
  private readonly baseUrl = `${environment.apiBaseUrl}/resources`;
  private readonly categoriesUrl = `${environment.apiBaseUrl}/resource-categories`;

  constructor(private readonly http: HttpClient) {}

  list(categoryId?: number, type?: ResourceType): Observable<TeachingResource[]> {
    const params: Record<string, string> = {};
    if (categoryId) params['categoryId'] = String(categoryId);
    if (type) params['type'] = type;
    return this.http.get<TeachingResource[]>(this.baseUrl, { params });
  }

  upload(request: UploadResourceRequest): Observable<TeachingResource> {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('title', request.title);
    if (request.description) formData.append('description', request.description);
    formData.append('type', request.type);
    formData.append('categoryId', String(request.categoryId));
    return this.http.post<TeachingResource>(this.baseUrl, formData);
  }

  download(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${id}/download`, { responseType: 'blob' });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  listCategories(): Observable<ResourceCategory[]> {
    return this.http.get<ResourceCategory[]>(this.categoriesUrl);
  }

  createCategory(name: string, description?: string): Observable<ResourceCategory> {
    return this.http.post<ResourceCategory>(this.categoriesUrl, { name, description });
  }
}
