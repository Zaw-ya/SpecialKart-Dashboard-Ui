import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

export type MetaSourceForm = 'ContactForm' | 'OrderForm' | 'DemoRequestForm' | string;

export interface MetaLeadEvent {
  id: number;
  eventId: string;
  sourceForm: MetaSourceForm;
  sourceRecordId: string | null;
  eventName: string;
  eventTime: string;
  eventSourceUrl: string | null;
  sent: boolean;
  sentAt: string | null;
  fbTraceId: string | null;
  error: string | null;
  createdAt: string;
}

export interface MetaLeadEventsPage {
  total: number;
  page: number;
  pageSize: number;
  items: MetaLeadEvent[];
}

export interface MetaLeadFormSummary {
  sourceForm: MetaSourceForm;
  total: number;
  sent: number;
  failed: number;
}

export interface MetaLeadSummary {
  days: number;
  total: number;
  sent: number;
  failed: number;
  byForm: MetaLeadFormSummary[];
}

export interface MetaLeadEventsQuery {
  sourceForm?: string;
  sent?: boolean | null;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}

/** Status of a record's Lead delivery, used by the small "Meta" column on the submission screens. */
export type MetaRecordStatus = 'sent' | 'failed' | 'none';

@Injectable({ providedIn: 'root' })
export class MetaLeadEventsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/meta/lead-events`;

  getAll(query: MetaLeadEventsQuery = {}): Observable<MetaLeadEventsPage> {
    let params = new HttpParams();
    if (query.sourceForm) params = params.set('sourceForm', query.sourceForm);
    if (query.sent === true || query.sent === false) params = params.set('sent', query.sent);
    if (query.from) params = params.set('from', query.from);
    if (query.to) params = params.set('to', query.to);
    params = params.set('page', query.page ?? 1).set('pageSize', query.pageSize ?? 50);

    return this.http.get<MetaLeadEventsPage>(this.apiUrl, { params });
  }

  getSummary(days = 30): Observable<MetaLeadSummary> {
    return this.http.get<MetaLeadSummary>(`${this.apiUrl}/summary`, { params: new HttpParams().set('days', days) });
  }

  /** Map of sourceRecordId -> delivery status for one form, for the "Meta" column. */
  getStatusMap(sourceForm: MetaSourceForm, pageSize = 200): Observable<Record<string, MetaRecordStatus>> {
    return this.getAll({ sourceForm, pageSize }).pipe(
      map((res) => {
        const map: Record<string, MetaRecordStatus> = {};
        // Newest first: a later (older) row must not overwrite the most recent outcome.
        for (const e of res.items) {
          if (!e.sourceRecordId || map[e.sourceRecordId]) continue;
          map[e.sourceRecordId] = e.sent ? 'sent' : 'failed';
        }
        return map;
      })
    );
  }
}

export const META_FORM_LABELS: Record<string, string> = {
  ContactForm: 'نموذج التواصل',
  OrderForm: 'نموذج الطلب',
  DemoRequestForm: 'طلب التجربة'
};

export const META_FORM_ROUTES: Record<string, string> = {
  ContactForm: '/contacts',
  OrderForm: '/orders',
  DemoRequestForm: '/demo-requests'
};

export function metaFormLabel(sourceForm: string | null | undefined): string {
  if (!sourceForm) return '—';
  return META_FORM_LABELS[sourceForm] ?? sourceForm;
}
