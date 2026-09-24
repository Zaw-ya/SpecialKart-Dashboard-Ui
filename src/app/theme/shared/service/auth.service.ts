import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

export type AppRole = 'Admin' | 'Marketer' | 'CustomerSupport';

export interface UserSession {
  isSuccess?: boolean;
  message?: string;
  token?: string;
  expiry?: string;
  email?: string;
  roles?: string[];
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  private activeRoleSubject: BehaviorSubject<AppRole>;
  public activeRole$: Observable<AppRole>;

  private simulatedRoleKey = 'simulatedRole';

  constructor(private http: HttpClient) {
    const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.currentUserSubject = new BehaviorSubject<any>(storedUser);
    this.currentUser = this.currentUserSubject.asObservable();

    const initialRole = this.resolveActiveRole(storedUser);
    this.activeRoleSubject = new BehaviorSubject<AppRole>(initialRole);
    this.activeRole$ = this.activeRoleSubject.asObservable();
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  public get activeRole(): AppRole {
    return this.activeRoleSubject.value;
  }

  login(email: string, password: string): Observable<any> {
    console.log('Attempting login for:', email);
    localStorage.removeItem(this.simulatedRoleKey);
    return this.http.post<any>(`${environment.apiUrl}/Auth/login`, { email, password }).pipe(
      map((user) => {
        console.log('Login successful, response:', user);
        // store user details and jwt token in local storage to keep user logged in between page refreshes
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.updateActiveRole(user);
        return user;
      })
    );
  }

  register(fullName: string, email: string, password: string, role: string = 'Admin'): Observable<any> {
    console.log('Attempting registration for:', email, 'role:', role);
    return this.http.post<any>(`${environment.apiUrl}/Auth/register`, { fullName, email, password, role });
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('currentUser');
    localStorage.removeItem(this.simulatedRoleKey);
    this.currentUserSubject.next(null);
    this.activeRoleSubject.next('Admin');
  }

  isLoggedIn(): boolean {
    const user = this.currentUserValue;
    return !!(user && user.token);
  }

  /**
   * Parse token payload to extract role claims or explicit properties
   */
  public getRoles(explicitUser?: any): string[] {
    const user = explicitUser || this.currentUserValue;
    if (!user) return [];

    const explicitRoles: string[] = [];
    if (user.role && typeof user.role === 'string') explicitRoles.push(user.role);
    if (Array.isArray(user.roles)) explicitRoles.push(...user.roles);
    if (explicitRoles.length > 0) return explicitRoles;

    if (!user.token) return [];

    try {
      const parts = user.token.split('.');
      if (parts.length === 3) {
        const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(payloadBase64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const decoded = JSON.parse(jsonPayload);

        // Check standard Microsoft claim URI and JWT role claims
        const rawRole =
          decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
          decoded['role'] ||
          decoded['roles'];

        if (Array.isArray(rawRole)) {
          return rawRole;
        } else if (typeof rawRole === 'string' && rawRole.trim()) {
          return [rawRole.trim()];
        }
      }
    } catch (e) {
      console.warn('Failed to parse JWT payload:', e);
    }

    // Backward compatibility default for existing tokens without explicit claims
    return ['Admin'];
  }

  public getActiveRole(): AppRole {
    return this.activeRoleSubject.value;
  }

  public hasRole(roles: string | string[]): boolean {
    const current = (this.getActiveRole() || '').toLowerCase().trim();
    if (!current) return false;

    // System Admin always passes all permission checks
    if (current === 'admin') return true;

    const list = (Array.isArray(roles) ? roles : [roles]).map((r) => (r || '').toLowerCase().trim());
    const isCurrentSupport = current.includes('customer') || current.includes('support');
    const isCurrentMarketer = current.includes('market');

    return list.some((r) => {
      if (r === current) return true;
      if (isCurrentSupport && (r.includes('customer') || r.includes('support'))) return true;
      if (isCurrentMarketer && r.includes('market')) return true;
      return false;
    });
  }

  public isAdmin(): boolean {
    return this.getActiveRole() === 'Admin';
  }

  public isMarketer(): boolean {
    return this.getActiveRole() === 'Marketer';
  }

  public isCustomerSupport(): boolean {
    return this.getActiveRole() === 'CustomerSupport';
  }

  /**
   * For testing and role previewing: switch simulated persona
   */
  public setSimulatedRole(role: AppRole | null) {
    if (role) {
      localStorage.setItem(this.simulatedRoleKey, role);
      this.activeRoleSubject.next(role);
    } else {
      localStorage.removeItem(this.simulatedRoleKey);
      this.updateActiveRole(this.currentUserValue);
    }
  }

  public isSimulating(): boolean {
    return !!localStorage.getItem(this.simulatedRoleKey);
  }

  private resolveActiveRole(user: any): AppRole {
    const simulated = localStorage.getItem(this.simulatedRoleKey) as AppRole;
    if (simulated && ['Admin', 'Marketer', 'CustomerSupport'].includes(simulated)) {
      return simulated;
    }

    const roles = this.getRoles(user).map((r) => (r || '').toLowerCase().trim());
    if (roles.some((r) => r.includes('admin'))) return 'Admin';
    if (roles.some((r) => r.includes('market'))) return 'Marketer';
    if (roles.some((r) => r.includes('customer') || r.includes('support'))) return 'CustomerSupport';

    return 'Admin';
  }

  private updateActiveRole(user: any) {
    const resolved = this.resolveActiveRole(user);
    this.activeRoleSubject.next(resolved);
  }
}

