import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsocketTestComponent } from './websocket-test/websocket-test.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, WebsocketTestComponent],
  template: `
    <h1>My App</h1>
    <app-websocket-test></app-websocket-test>
  `,
  styles: [],
})
export class AppComponent {}
