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

  http = inject(HttpClient);

  constructor(private router: Router) {}

  redirectToLogin() {
    this.router.navigate(['/login']);
  }

  onRegister() {
    this.http.post("https://localhost:7192/api/Auth/Register", this.registerObj)
      .pipe(
        catchError((error) => {
          this.handleError(error);
          return throwError(() => new Error(error));
        })
      )
      .subscribe({
        next: (res: any) => {
          if (res && res.isSuccessful) {
            alert('Registration successful'); //remove later
            this.redirectToLogin();
          } else {
            this.errorMessages = res.errors || ["An unknown error occurred. Please try again later."];
          }
        },
        error: (err) => {
          this.handleError(err);
        }
      });
  }

  private handleError(error: any) {
    if (error.status === 400 && error.error && error.error.errors) {
      this.errorMessages = error.error.errors;
    } else {
      this.errorMessages = ["An unknown error occurred. Please try again later."];
    }
  }
}
