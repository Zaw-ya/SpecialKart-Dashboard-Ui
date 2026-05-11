import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface PackagePricingTier {
  id?: number;
  minInvitations: number;
  maxInvitations: number;
  price: number;
  packageId?: number;
}

export interface Package {
  id: number;
  name: string;
  description: string;
  compensationPercentage: number;
  isPopular: boolean;
  isActive: boolean;
  pricingTiers?: PackagePricingTier[];
  featureIds?: number[];
  features?: { id: number; description: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class PackageService {
  private apiUrl = `${environment.apiUrl}/Packages`;
  private packages$: Observable<Package[]> | null = null;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Package[]> {
    return this.http.get<Package[]>(this.apiUrl);
  }

  getActive(): Observable<Package[]> {
    return this.http.get<Package[]>(`${this.apiUrl}/active`);
  }

  getById(id: number): Observable<Package> {
    return this.http.get<Package>(`${this.apiUrl}/${id}`);
  }

  create(pkg: Package): Observable<Package> {
    this.clearCache();
    return this.http.post<Package>(this.apiUrl, pkg);
  }

  update(id: number, pkg: Package): Observable<Package> {
    this.clearCache();
    return this.http.put<Package>(`${this.apiUrl}/${id}`, pkg);
  }

  delete(id: number): Observable<any> {
    this.clearCache();
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  toggleActive(id: number): Observable<any> {
    this.clearCache();
    return this.http.patch(`${this.apiUrl}/${id}/toggle-active`, {});
  }

  clearCache() {}
}
