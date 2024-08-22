import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-word-length',
  standalone: true,
  imports: [],
  template: `<p>Length of the word:</p>
    <div class="word-length-display">{{ wordLength }}</div>`,
  styleUrls: ['./word-length.component.css'],
})
export class WordLengthComponent implements OnChanges {
  @Input() word: string = '';
  wordLength: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['word'] && changes['word'].currentValue) {
      console.log(this.word);
      this.wordLength = this.word.length;
    }
  }
}
