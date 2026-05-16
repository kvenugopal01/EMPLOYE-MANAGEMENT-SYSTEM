import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    if (this.authService.isLoggedIn) return true;
    // Store attempted URL for post-login redirect
    return this.router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  }
}

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const allowedRoles = route.data['roles'] as string[];
    if (!this.authService.isLoggedIn) {
      return this.router.createUrlTree(['/login']);
    }
    if (!allowedRoles || allowedRoles.includes(this.authService.userRole)) {
      return true;
    }
    // Redirect to dashboard instead of /unauthorized (which doesn't exist)
    return this.router.createUrlTree(['/dashboard']);
  }
}

@Injectable({ providedIn: 'root' })
export class GuestGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    if (!this.authService.isLoggedIn) return true;
    return this.router.createUrlTree(['/dashboard']);
  }
}
