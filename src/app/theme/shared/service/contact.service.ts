import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = `${environment.apiUrl}/Contacts`;
  private messages$: Observable<ContactMessage[]> | null = null;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ContactMessage[]> {
    return this.http.get<ContactMessage[]>(this.apiUrl);
  }

  getById(id: number): Observable<ContactMessage> {
    return this.http.get<ContactMessage>(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: number, isRead: boolean): Observable<ContactMessage> {
    this.clearCache();
    return this.http.patch<ContactMessage>(`${this.apiUrl}/${id}/status`, { isRead });
  }

  delete(id: number): Observable<any> {
    this.clearCache();
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  clearCache() {}
}
