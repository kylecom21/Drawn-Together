import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsocketTestComponent } from './websocket-test/websocket-test.component';
import { TimerComponent } from './timer/timer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, WebsocketTestComponent, TimerComponent],
  template: `
    <h1>{{ title }}</h1>
    <app-websocket-test></app-websocket-test>
    <app-timer></app-timer>
  `,
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'My Angular App';
}
