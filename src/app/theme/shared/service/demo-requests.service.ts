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
  eventType: string | null;
  category: string | null;
  image: string | null;
  createdAt: string;
}

export interface AdminResendDemoRequest {
  whatsAppNumber: string;
  name?: string | null;
  invitationCardId?: number | null;
  eventType?: string | null;
  category?: string | null;
}

export interface DemoAdminResult {
  success?: boolean;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class DemoRequestsService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/Demo`;

  getAll(): Observable<DemoRequest[]> {
    return this.http.get<DemoRequest[]>(`${this.baseUrl}/requests`);
  }

  /** Re-sends the free demo card to the customer on WhatsApp without asking for a new OTP. */
  adminResend(request: AdminResendDemoRequest): Observable<DemoAdminResult> {
    return this.http.post<DemoAdminResult>(`${this.baseUrl}/admin/resend`, request);
  }

  /** Clears the "already used the free trial" lock so the number can request a demo again. */
  adminReset(whatsAppNumber: string): Observable<DemoAdminResult> {
    return this.http.post<DemoAdminResult>(`${this.baseUrl}/admin/reset`, { whatsAppNumber });
  }
}
