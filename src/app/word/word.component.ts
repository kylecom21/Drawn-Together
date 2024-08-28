import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsocketService } from '../web-socket.service';
import { Word } from '../../../api';
import { GameStateService } from '../game-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-word',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-center font-bold text-xl">
      <div class="word-container">
        <ng-container *ngIf="isActiveDrawer; else guesser">
          <h2 class="word-title">Current Word:</h2>
          <div class="word-info">
            <div class="word-display">{{ word }}</div>
          </div>
        </ng-container>
        <ng-template #guesser>
          <h2 class="word-title">Guess the word!</h2>
          <div class="word-length-display">
            Word Length: {{ word ? word.length : 0 }}
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [
    `
      .word-container {
        text-align: center;
        padding: 1rem;
        background-color: #f0f4f8;
        border-radius: 0.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      .word-title {
        font-size: 1.2rem;
        font-weight: bold;
        color: #4a5568;
        margin-bottom: 0.5rem;
      }
      .word-info {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 1rem;
      }
      .word-display,
      .word-length-display {
        font-size: 2rem;
        font-weight: bold;
        color: #2d3748;
        padding: 0.5rem 1rem;
        background-color: #ffffff;
        border-radius: 0.5rem;
        display: inline-block;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }
      .word-container{
        background-color: #C8D3BE;
      }
    `,
  ],
})
export class WordComponent implements OnInit, OnDestroy {
  word: string = '';
  isActiveDrawer: boolean = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private websocketService: WebsocketService,
    private wordService: Word,
    private gameStateService: GameStateService
  ) {}

  ngOnInit() {
    console.log('WordComponent initialized');
    this.subscriptions.push(
      this.gameStateService.isActiveDrawer$.subscribe((isActive) => {
        console.log('Is active drawer:', isActive);
        this.isActiveDrawer = isActive;
        if (isActive) {
          this.generateWord();
        } else {
          this.websocketService.emit('request-current-word', {});
        }
      }),
      this.gameStateService.currentWord$.subscribe((word) => {
        console.log('Current word updated:', word, 'Length:', word.length);
        this.word = word;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  private generateWord() {
    this.wordService.getWord().subscribe((response) => {
      console.log('New word generated:', response.word);
      this.gameStateService.setCurrentWord(response.word);
      this.websocketService.emit('new-word', { word: response.word });
    });
  }
}
