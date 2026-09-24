import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface ManagedUser {
  id: string;
  userName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  roles: string[];
  emailConfirmed?: boolean;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  userName?: string;
  role: string;
}

export interface UpdateUserPayload {
  email?: string;
  userName?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiUrl = `${environment.apiUrl}/Users`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<ManagedUser[]> {
    return this.http.get<ManagedUser[]>(this.apiUrl);
  }

  getById(id: string): Observable<ManagedUser> {
    return this.http.get<ManagedUser>(`${this.apiUrl}/${id}`);
  }

  create(payload: CreateUserPayload): Observable<ManagedUser> {
    return this.http.post<ManagedUser>(this.apiUrl, payload);
  }

  update(id: string, payload: UpdateUserPayload): Observable<ManagedUser> {
    return this.http.put<ManagedUser>(`${this.apiUrl}/${id}`, payload);
  }

  changePassword(id: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/${id}/change-password`, { newPassword });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
