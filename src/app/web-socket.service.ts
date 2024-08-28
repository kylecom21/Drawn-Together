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

  private messagesSubject = new BehaviorSubject<any[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  constructor() {
    this.socket = io(environment.websocketUrl, {
      autoConnect: false,
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      this.connectionStatusSubject.next('Connected');
    });

    this.socket.on('disconnect', () => {
      this.connectionStatusSubject.next('Disconnected');
    });

    // Listen to incoming chat messages
    this.socket.on('chat-message', (message) => {
      this.messagesSubject.next([...this.messagesSubject.value, message]);
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
