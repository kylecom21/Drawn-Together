import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsocketTestComponent } from './websocket/websocket.component';
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
    WordComponent,
  ],
  template: `
    <div class="min-h-screen bg-gray-100 flex flex-col">
      <header class="bg-white shadow text-center">
        <div
          class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center"
        >
          <h1 class="text-2xl font-bold text-gray-900">Drawn Together</h1>
          <!-- <nav>
            <ul class="flex space-x-4">
              <li>
                <a href="#" class="text-gray-600 hover:text-gray-900">Home</a>
              </li>
              <li>
                <a href="#" class="text-gray-600 hover:text-gray-900">Rules</a>
              </li>
              <li>
                <a href="#" class="text-gray-600 hover:text-gray-900"
                  >Leaderboard</a
                >
              </li>
            </ul>
          </nav> -->
        </div>
      </header>
      <main class="main-page">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div class="mb-6 bg-white shadow rounded-lg p-4">
            <app-word></app-word>
          </div>
          <div class="flex flex-col lg:flex-row gap-6">
            <div class="lg:w-3/4">
              <div class="bg-white shadow rounded-lg p-4">
                <app-whiteboard></app-whiteboard>
              </div>
            </div>
            <div class="lg:w-1/4 space-y-6">
              <div class="bg-white shadow rounded-lg p-4">
                <app-timer></app-timer>
              </div>
              <div class="bg-white shadow rounded-lg p-4">
                <app-chatbox></app-chatbox>
              </div>
              <div class="bg-white shadow rounded-lg p-4">
                <app-websocket-test></app-websocket-test>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
})
export class AppComponent {
  title = 'Drawn Together';
}
