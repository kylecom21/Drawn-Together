import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsocketTestComponent } from './websocket-test/websocket-test.component';
import { TimerComponent } from './timer/timer.component';
import { ChatboxComponent } from './chatbox/chatbox.component';
import { WhiteboardComponent } from './whiteboard/whiteboard.component';
import { WordComponent } from './word/word.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    WebsocketTestComponent,
    TimerComponent,
    ChatboxComponent,
    WhiteboardComponent,
    WordComponent
  ],
  template: `
    <h1>{{ title }}</h1>
    <div class="app-container">
      <div class="left-panel">
        <app-websocket-test></app-websocket-test>
        <app-timer></app-timer>
      </div>
      <div class="right-panel">
        <app-whiteboard></app-whiteboard>
        <app-chatbox></app-chatbox>
        <app-word></app-word>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    }
    .left-panel, .right-panel {
      width: 48%;
    }
  `]
})
export class AppComponent {
  title = 'Collaborative Workspace';
}
