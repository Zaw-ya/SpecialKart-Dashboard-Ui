import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface SiteSetting {
  key: string;
  value: string;
}

@Injectable({
  providedIn: 'root'
})
export class SiteSettingsService {
  private apiUrl = `${environment.apiUrl}/SiteSettings`;

  constructor(private http: HttpClient) {}

  get(key: string): Observable<SiteSetting> {
    return this.http.get<SiteSetting>(`${this.apiUrl}/${key}`);
  }

  getAll(): Observable<{ [key: string]: string }> {
    return this.http.get<{ [key: string]: string }>(this.apiUrl);
  }

  set(key: string, value: string): Observable<SiteSetting> {
    return this.http.put<SiteSetting>(`${this.apiUrl}/${key}`, { value });
  }

  setBatch(settings: { [key: string]: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/batch`, settings);
  }
}
