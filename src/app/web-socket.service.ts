import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from './environments/environment';

interface ChatMessage {
  name: string;
  message: string;
  isOwnMessage: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private socket: Socket;
  private connectionStatusSubject = new BehaviorSubject<
    'Connecting' | 'Connected' | 'Disconnected'
  >('Disconnected');
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  public messages$ = this.messagesSubject.asObservable();

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

    this.socket.on('chat-message', (data: ChatMessage) => {
      this.addMessage({ ...data, isOwnMessage: false });
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

  addMessage(message: ChatMessage) {
    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, message]);
  }

  getMessages(): ChatMessage[] {
    return this.messagesSubject.value;
  }

  sendMessage(message: ChatMessage) {
    this.socket.emit('send-chat-message', message);
    this.addMessage({ ...message, isOwnMessage: true });
  }
}
