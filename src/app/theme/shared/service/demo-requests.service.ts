import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface DemoRequest {
  id: number;
  name: string;
  whatsAppNumber: string;
  isVerified: boolean;
  invitationCardId: number | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class DemoRequestsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Demo/requests`;

  getAll(): Observable<DemoRequest[]> {
    return this.http.get<DemoRequest[]>(this.apiUrl);
  }
}
