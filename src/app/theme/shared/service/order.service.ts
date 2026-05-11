import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from 'src/environments/environment';

export enum OrderStatus {
  Pending = 0,
  Processing = 1,
  Completed = 2,
  Cancelled = 3
}

export interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  quantity: number;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  notes: string;
  invitationCardId?: number;
  packageId?: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/Orders`;
  private orders$: Observable<Order[]> | null = null;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: number, status: OrderStatus): Observable<Order> {
    this.clearCache();
    return this.http.patch<Order>(`${this.apiUrl}/${id}/status`, { status });
  }

  delete(id: number): Observable<any> {
    this.clearCache();
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  clearCache() {}
}
