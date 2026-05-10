import { Component, OnInit } from '@angular/core';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/theme/shared/service/auth.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-auth-login',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './auth-login.component.html',
  styleUrl: './auth-login.component.scss'
})
export class AuthLoginComponent implements OnInit {
  email = '';
  password = '';
  loading = false;
  error = '';
  returnUrl = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    // redirect to home if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  login() {
    this.loading = true;
    this.error = '';

    this.authService
      .login(this.email, this.password)
      .pipe(first())
      .subscribe({
        next: (res) => {
          console.log('Login success in component, redirecting to:', this.returnUrl);
          this.router.navigate([this.returnUrl]);
        },
        error: (err) => {
          console.error('Login error in component:', err);
          this.error = err.error?.message || err.error || err.message || 'Invalid credentials';
          this.loading = false;
        }
      });
  }
}

