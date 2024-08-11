import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  private requestUpdatedSource = new Subject<void>();

  requestUpdated$ = this.requestUpdatedSource.asObservable();

  constructor() {
    this.startConnection();
    this.addRequestUpdateListener();
  }

  private startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7192/requestHub') 
      .configureLogging(signalR.LogLevel.Information)  
      .build();

    this.hubConnection.onclose((error) => {
      console.error('SignalR connection closed:', error);
    });

    this.hubConnection.onreconnecting((error) => {
      console.warn('SignalR connection reconnecting:', error);
    });

    this.hubConnection.onreconnected((connectionId) => {
      console.log('SignalR connection reconnected, connectionId:', connectionId);
    });

    this.hubConnection
      .start()
      .then(() => console.log('SignalR Connected'))
      .catch(err => console.log('Error while starting SignalR connection: ' + err));
  }

  private addRequestUpdateListener(): void {
    this.hubConnection.on('ReceiveRequestUpdate', () => {
      console.log('Request status updated');
      this.requestUpdatedSource.next();
    });
  }
}
