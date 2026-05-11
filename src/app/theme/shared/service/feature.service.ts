import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Feature {
  id: number;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class FeatureService {
  private apiUrl = `${environment.apiUrl}/Features`;
  private features$: Observable<Feature[]> | null = null;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Feature[]> {
    return this.http.get<Feature[]>(this.apiUrl);
  }

  clearCache() {}

  create(feature: any): Observable<Feature> {
    return this.http.post<Feature>(this.apiUrl, feature);
  }

  update(id: number, feature: any): Observable<Feature> {
    return this.http.put<Feature>(`${this.apiUrl}/${id}`, feature);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
