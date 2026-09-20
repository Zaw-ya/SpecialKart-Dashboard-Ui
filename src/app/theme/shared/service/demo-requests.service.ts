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

export interface DemoCardImageResult {
  url: string;
  contentType: string;
  sizeBytes: number;
}

/** WhatsApp rejects media larger than this, so the file is checked before it is uploaded. */
export const MAX_DEMO_CARD_IMAGE_BYTES = 5 * 1024 * 1024;

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

  /**
   * Uploads the demo card image to the API's own wwwroot and saves the resulting
   * public URL as `demo-default-image-url`. That URL is what gets passed to the
   * WhatsApp template as variable {{2}}.
   */
  uploadCardImage(file: File): Observable<DemoCardImageResult> {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http.post<DemoCardImageResult>(`${this.baseUrl}/admin/card-image`, form);
  }
}
