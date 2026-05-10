import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/theme/shared/service/auth.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-auth-register',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './auth-register.component.html',
  styleUrl: './auth-register.component.scss'
})
export class AuthRegisterComponent {
  fullName = '';
  email = '';
  password = '';
  loading = false;
  error = '';
  success = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register() {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.authService
      .register(this.fullName, this.email, this.password)
      .pipe(first())
      .subscribe({
        next: () => {
          this.success = 'Account created successfully! You can now login.';
          this.loading = false;
          // Optionally redirect after a delay
          setTimeout(() => this.router.navigate(['/login']), 2000);
        },
        error: (err) => {
          console.error('Registration error:', err);
          this.error = err.error?.message || err.error || err.message || 'Failed to create account';
          this.loading = false;
        }
      });
  }
}

