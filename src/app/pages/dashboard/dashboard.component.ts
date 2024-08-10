import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  username: string | null = null;
  requests: any[] = [];
  private apiUrl = 'https://localhost:7192/user'; // Hardcoded API URL for username
  private requestsUrl = 'https://localhost:7192/api/Request'; // Hardcoded API URL for requests

  http = inject(HttpClient);

  ngOnInit(): void {
    this.fetchUsername();
    this.fetchRequests();
  }

  fetchUsername(): void {
    const token = localStorage.getItem('accessToken'); // Ensure this is set after login

    if (token) {
      this.http.get(this.apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'text' // Specify that the response is plain text
      }).subscribe(
        response => {
          this.username = response.trim(); // Trim any whitespace and set the username
        },
        error => {
          console.error('Error fetching username', error);
          this.username = null;
        }
      );
    } else {
      console.warn('No token found in localStorage');
      this.username = null;
    }
  }

  fetchRequests(): void {
    const token = localStorage.getItem('accessToken'); // Ensure this is set after login

    if (token) {
      this.http.get<any[]>(this.requestsUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).subscribe(
        response => {
          this.requests = response;
        },
        error => {
          console.error('Error fetching requests', error);
          this.requests = [];
        }
      );
    } else {
      console.warn('No token found in localStorage');
      this.requests = [];
    }
  }

  getStatusClass(status: string): string {
    return status === 'įvykdytas' ? 'status-completed' : 
           status === 'pateiktas' ? 'status-pending' : '';
  }

  handleButtonClick(): void {
    console.log('Button clicked');
    // Implement button click functionality here
  }
}
