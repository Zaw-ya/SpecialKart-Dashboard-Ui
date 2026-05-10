import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface City {
  id: number;
  name: string;
  countryId: number;
  countryName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CityService {
  private apiUrl = `${environment.apiUrl}/Cities`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<City[]> {
    return this.http.get<City[]>(this.apiUrl);
  }

  getByCountry(countryId: number): Observable<City[]> {
    return this.http.get<City[]>(`${this.apiUrl}/country/${countryId}`);
  }

  getById(id: number): Observable<City> {
    return this.http.get<City>(`${this.apiUrl}/${id}`);
  }

  create(city: { name: string; countryId: number }): Observable<City> {
    return this.http.post<City>(this.apiUrl, city);
  }

  update(id: number, city: { name: string; countryId: number }): Observable<City> {
    return this.http.put<City>(`${this.apiUrl}/${id}`, city);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
