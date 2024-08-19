import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsocketService } from '../web-socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-websocket-test',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './websocket-test.component.html',
  styleUrls: ['./websocket-test.component.css'],
})
export class WebsocketTestComponent implements OnInit, OnDestroy {
  messages: string[] = [];
  private subscription: Subscription | undefined;

  constructor(private websocketService: WebsocketService) {}

  ngOnInit() {
    this.subscription = this.websocketService
      .listen('message')
      .subscribe((data: any) => {
        this.messages.push(data);
      });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.disconnect();
  }

  connect() {
    this.websocketService.connect();
    this.messages.push('Attempting to connect...');
  }

  disconnect() {
    this.websocketService.disconnect();
    this.messages.push('Disconnected from server');
  }

  sendMessage() {
    this.websocketService.emit('message', 'Test message from Angular');
  }
}
