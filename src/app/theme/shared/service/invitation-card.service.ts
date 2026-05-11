import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface InvitationCard {
  id: number;
  title: string;
  gender: number;
  price: number;
  imageUrl: string;
  isVisible: boolean;
  inCarousel: boolean;
  rating: number;
  eventTypeIds?: number[];
}

@Injectable({
  providedIn: 'root'
})
export class InvitationCardService {
  private apiUrl = `${environment.apiUrl}/InvitationCards`;
  private cards$: Observable<InvitationCard[]> | null = null;

  constructor(private http: HttpClient) {}

  getAll(): Observable<InvitationCard[]> {
    return this.http.get<InvitationCard[]>(this.apiUrl);
  }

  // Add a clearCache method for when data changes
  clearCache() {}

  getById(id: number): Observable<InvitationCard> {
    return this.http.get<InvitationCard>(`${this.apiUrl}/${id}`);
  }

  create(card: FormData): Observable<InvitationCard> {
    return this.http.post<InvitationCard>(this.apiUrl, card);
  }

  update(id: number, card: FormData): Observable<InvitationCard> {
    return this.http.put<InvitationCard>(`${this.apiUrl}/${id}`, card);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
