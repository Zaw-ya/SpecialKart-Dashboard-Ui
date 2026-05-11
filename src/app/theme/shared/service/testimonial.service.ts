import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  rating: number;
  imageUrl: string;
  imagePublicId: string;
  isVisible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TestimonialService {
  private apiUrl = `${environment.apiUrl}/Testimonials`;
  private testimonials$: Observable<Testimonial[]> | null = null;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Testimonial[]> {
    return this.http.get<Testimonial[]>(this.apiUrl);
  }

  getVisible(minRating: number = 0): Observable<Testimonial[]> {
    return this.http.get<Testimonial[]>(`${this.apiUrl}/visible?minRating=${minRating}`);
  }

  getById(id: number): Observable<Testimonial> {
    return this.http.get<Testimonial>(`${this.apiUrl}/${id}`);
  }

  create(testimonial: FormData): Observable<Testimonial> {
    this.clearCache();
    return this.http.post<Testimonial>(this.apiUrl, testimonial);
  }

  update(id: number, testimonial: FormData): Observable<Testimonial> {
    this.clearCache();
    return this.http.put<Testimonial>(`${this.apiUrl}/${id}`, testimonial);
  }

  delete(id: number): Observable<any> {
    this.clearCache();
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  clearCache() {}
}
