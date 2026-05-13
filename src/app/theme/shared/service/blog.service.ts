import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface BlogPost {
  id: number;
  title: string;
  content: string;
  imageUrl: string;
  imagePublicId: string;
  author: string;
  createdAt: string;
  isPublished: boolean;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  altText?: string;
  category?: string;
  tags?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private apiUrl = `${environment.apiUrl}/Blog`;
  private blogPosts$: Observable<BlogPost[]> | null = null;

  constructor(private http: HttpClient) {}

  getAll(): Observable<BlogPost[]> {
    return this.http.get<BlogPost[]>(this.apiUrl);
  }

  getPublished(): Observable<BlogPost[]> {
    return this.http.get<BlogPost[]>(`${this.apiUrl}/published`);
  }

  getById(id: number): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.apiUrl}/${id}`);
  }

  create(post: FormData): Observable<BlogPost> {
    this.clearCache();
    return this.http.post<BlogPost>(this.apiUrl, post);
  }

  update(id: number, post: FormData): Observable<BlogPost> {
    this.clearCache();
    return this.http.put<BlogPost>(`${this.apiUrl}/${id}`, post);
  }

  delete(id: number): Observable<any> {
    this.clearCache();
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  clearCache() {}
}
