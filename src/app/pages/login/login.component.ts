import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule], 
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginObj: { email: string; password: string } = { email: '', password: '' };
  errorMessage: string | null = null; 
  tokenExpiryTimer: any;
  private loginUrl = 'https://localhost:7192/login'; 
  

  http = inject(HttpClient);

  constructor(private router: Router) {}

  redirectToRegister() {
    this.router.navigate(['/register']);
  }

  onLogin() {
    this.http.post<{ accessToken: string, expiresIn: number }>(this.loginUrl, this.loginObj)
      .pipe(
        catchError((error) => {
          this.handleError(error);
          return throwError(() => new Error(error));
        })
      )
      .subscribe((res: any) => {
        if (res && res.accessToken) {
          localStorage.setItem('accessToken', res.accessToken);

          this.setLogoutTimer(res.expiresIn);

          this.router.navigate(['/dashboard']);
        }
      });
  }

  private handleError(error: any) {
    if (error.status === 401) {
      this.errorMessage = "Incorrect username or password";
    } else {
      this.errorMessage = "An unknown error occurred. Please try again later.";
    }
  }

  private setLogoutTimer(expiresIn: number) {
    if (this.tokenExpiryTimer) {
      clearTimeout(this.tokenExpiryTimer);
    }

    this.tokenExpiryTimer = setTimeout(() => {
      this.logout();
    }, expiresIn * 1000); 
  }

  private logout(): void {
    localStorage.removeItem('accessToken');
    if (this.tokenExpiryTimer) {
      clearTimeout(this.tokenExpiryTimer);
    }
    this.router.navigate(['/login']); 
  }
}
