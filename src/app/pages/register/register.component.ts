import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; 
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  registerObj: { username: string; password: string } = { username: '', password: '' };
  errorMessages: string[] = []; 
  private registerUrl = 'https://localhost:7192/api/auth/register'; 

  http = inject(HttpClient);

  constructor(private router: Router) {}

  redirectToLogin() {
    this.router.navigate(['/login']);
  }

  onRegister() {
    this.http.post(this.registerUrl, this.registerObj)
      .pipe(
        catchError((error) => {
          this.handleError(error);
          return throwError(() => new Error('Error during registration'));
        })
      )
      .subscribe({
        next: (res: any) => {
          if (res && res.isSuccessful) {
            this.redirectToLogin();
          }
        }
      });
  }

  private handleError(error: any) {
    if (error.error && error.error.errors) {
      this.errorMessages = error.error.errors;
    } else {
      this.errorMessages = ["An unknown error occurred. Please try again later."];
    }
  }
}
