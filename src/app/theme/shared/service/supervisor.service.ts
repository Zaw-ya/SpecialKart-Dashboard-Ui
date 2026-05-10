import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface Supervisor {
  id: number;
  name: string;
  nickname: string;
  imageUrl: string;
  rating: number;
  isVisible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SupervisorService {
  private apiUrl = `${environment.apiUrl}/Supervisors`;
  private supervisors$: Observable<Supervisor[]> | null = null;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Supervisor[]> {
    if (!this.supervisors$) {
      this.supervisors$ = this.http.get<Supervisor[]>(this.apiUrl).pipe(
        shareReplay(1)
      );
    }
    return this.supervisors$;
  }

  clearCache() {
    this.supervisors$ = null;
  }

  create(supervisor: any): Observable<Supervisor> {
    return this.http.post<Supervisor>(this.apiUrl, supervisor);
  }

  update(id: number, supervisor: any): Observable<Supervisor> {
    return this.http.put<Supervisor>(`${this.apiUrl}/${id}`, supervisor);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
