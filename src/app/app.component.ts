import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsocketTestComponent } from './websocket-test/websocket-test.component';
import { TimerComponent } from './timer/timer.component';
import { WhiteboardComponent } from './whiteboard/whiteboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    WebsocketTestComponent,
    TimerComponent,
    WhiteboardComponent,
  ],
  template: `
    <h1>{{ title }}</h1>
    <app-websocket-test></app-websocket-test>
    <app-timer></app-timer>
    <app-whiteboard></app-whiteboard>
  `,
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'My Angular App';
}
