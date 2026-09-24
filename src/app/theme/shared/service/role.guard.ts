import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRoles = route.data['expectedRoles'] as string[] | undefined;

    if (!expectedRoles || expectedRoles.length === 0) {
      return true;
    }

    if (this.authService.hasRole(expectedRoles)) {
      return true;
    }

    this.toastService.error('عفواً، ليس لديك الصلاحية الكافية للوصول إلى هذه الصفحة');
    if (state.url !== '/dashboard/default' && !state.url.startsWith('/dashboard/default')) {
      this.router.navigate(['/dashboard/default']);
    }
    return false;
  }
}
