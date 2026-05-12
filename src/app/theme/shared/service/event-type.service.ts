import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface EventType {
  id: number;
  name: string;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventTypeService {
  private apiUrl = `${environment.apiUrl}/EventTypes`;
  private eventTypes$: Observable<EventType[]> | null = null;

  constructor(private http: HttpClient) { }

  getAll(): Observable<EventType[]> {
    return this.http.get<EventType[]>(this.apiUrl);
  }

  clearCache() { }

  create(eventType: any): Observable<EventType> {
    return this.http.post<EventType>(this.apiUrl, eventType);
  }

  update(id: number, eventType: any): Observable<EventType> {
    return this.http.put<EventType>(`${this.apiUrl}/${id}`, eventType);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
