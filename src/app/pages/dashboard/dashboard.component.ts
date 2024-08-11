import { Component, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  username: string | null = null;
  requests: any[] = [];
  requestMessage: string = ''; 
  requestType: string = 'prašymas';  

  private apiUrl = 'https://localhost:7192/user'; 
  private requestsUrl = 'https://localhost:7192/api/request/all'; 
  private createRequestsUrl = 'https://localhost:7192/api/request';

  private hubConnection: HubConnection | undefined;  

  http = inject(HttpClient);

  ngOnInit(): void {
    this.fetchUsername();
    this.fetchRequests();
    this.setupSignalR();  
  }

  fetchUsername(): void {
    const token = localStorage.getItem('accessToken'); 

    if (token) {
      this.http.get(this.apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'text'
      }).subscribe({
        next: (response) => this.username = response.trim(),
        error: (error) => {
          console.error('Error fetching username', error);
          this.username = null;
        }
      });
    } else {
      console.warn('No token found in localStorage');
      this.username = null;
    }
  }

  fetchRequests(): void {
    const token = localStorage.getItem('accessToken'); 

    if (token) {
      this.http.get<any[]>(this.requestsUrl, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (response) => this.requests = response,
        error: (error) => {
          console.error('Error fetching requests', error);
          this.requests = [];
        }
      });
    } else {
      console.warn('No token found in localStorage');
      this.requests = [];
    }
  }

  getStatusClass(status: string): string {
    return status === 'įvykdytas' ? 'status-completed' : 
           status === 'pateiktas' ? 'status-pending' : '';
  }

  createRequest(): void {
    const requestData = {
      message: this.requestMessage,
      type: this.requestType
    };

    const token = localStorage.getItem('accessToken'); 

    if (token) {
      this.http.post(this.createRequestsUrl, requestData, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: (response) => {
          console.log('Request submitted successfully:', response);
          this.requestMessage = ''; 
          this.requestType = 'prašymas';
        },
        error: (error) => console.error('Error submitting request', error)
      });
    } else {
      console.warn('No token found in localStorage');
    }
  }

  setupSignalR(): void {
    const token = localStorage.getItem('accessToken');

    if (token) {
      this.hubConnection = new HubConnectionBuilder()
        .withUrl('https://localhost:7192/requestHub', {
          accessTokenFactory: () => token
        })
        .configureLogging(LogLevel.Information)  
        .build();

      this.hubConnection.on('ReceiveRequestUpdate', () => { 
        console.log('Received update from SignalR');
        this.fetchRequests(); 
      });

      this.hubConnection.start()
        .then(() => console.log('SignalR connected successfully'))
        .catch(err => console.error('SignalR connection error: ', err));
    } else {
      console.warn('No token found in localStorage');
    }
  }
}
