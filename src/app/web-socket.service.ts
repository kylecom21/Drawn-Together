import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from './environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private socket: Socket;
  private connectionStatusSubject = new BehaviorSubject<
    'Connecting' | 'Connected' | 'Disconnected'
  >('Disconnected');
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  constructor() {
    this.socket = io(environment.websocketUrl, {
      autoConnect: false,
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.connectionStatusSubject.next('Connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.connectionStatusSubject.next('Disconnected');
    });
  }

  connect() {
    this.connectionStatusSubject.next('Connecting');
    this.socket.connect();
  }

  disconnect() {
    this.socket.disconnect();
  }

  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }

  listen(eventName: string): Observable<any> {
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data) => {
        subscriber.next(data);
      });
    });
  }
}
