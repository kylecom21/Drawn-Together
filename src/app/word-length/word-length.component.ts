import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-word-length',
  standalone: true,
  template: ` <div class="word-length-display">({{ wordLength }})</div> `,
  styles: [
    `
      .word-length-display {
        font-size: 2rem;
        font-weight: bold;
        color: #2d3748;
      }
    `,
  ],
})
export class WordLengthComponent implements OnChanges {
  @Input() word: string = '';
  wordLength: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['word'] && changes['word'].currentValue) {
      this.wordLength = this.word.length;
    }
  }
}
