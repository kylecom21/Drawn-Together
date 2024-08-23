import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Inject,
  PLATFORM_ID,
  NgZone,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { WebsocketService } from '../web-socket.service';
import { WordComponent } from '../word/word.component';

@Component({
  selector: 'app-whiteboard',
  standalone: true,
  imports: [CommonModule, WordComponent],
  template: `
    <div class="space-y-4">
      <canvas #canvas class="w-full border border-gray-300 rounded-lg"></canvas>
      <div *ngIf="isActiveDrawer" class="flex flex-wrap gap-2 justify-center">
        <input
          type="color"
          (change)="setColor($event)"
          class="w-8 h-8 rounded-full"
        />
        <input
          type="range"
          min="1"
          max="20"
          (input)="setBrushSize($event)"
          class="w-32"
        />
        <button
          (click)="setTool('brush')"
          class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Brush
        </button>
        <button
          (click)="setTool('eraser')"
          class="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Eraser
        </button>
        <button
          (click)="fill()"
          class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Fill
        </button>
        <button
          (click)="undo()"
          class="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Undo
        </button>
        <button
          (click)="redo()"
          class="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Redo
        </button>
      </div>
      <div *ngIf="!isActiveDrawer" class="text-center">
        <p>Another player is drawing. Try to guess what it is!</p>
      </div>
      <app-word [isActiveDrawer]="isActiveDrawer"></app-word>
    </div>
  `,
})
export class WhiteboardComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D | null;
  private isDrawing = false;
  private color = '#000000';
  private brushSize = 5;
  private tool = 'brush';
  private undoStack: ImageData[] = [];
  private redoStack: ImageData[] = [];
  public isBrowser: boolean;
  public isActiveDrawer = false;

  constructor(
    private websocketService: WebsocketService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.setupSocketListeners();
    }
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      this.ngZone.runOutsideAngular(() => {
        this.setupCanvas();
      });
    }
  }

  private setupSocketListeners() {
    if (!this.isBrowser) return;

    this.websocketService.listen('draw').subscribe((data: any) => {
      this.drawFromSocket(data);
    });

    this.websocketService.listen('undo').subscribe(() => {
      this.undoFromSocket();
    });

    this.websocketService.listen('redo').subscribe(() => {
      this.redoFromSocket();
    });

    this.websocketService.listen('fill').subscribe((data: any) => {
      this.fillFromSocket(data);
    });

    this.websocketService.listen('start-drawing').subscribe(() => {
      this.isActiveDrawer = true;
    });

    this.websocketService.listen('end-drawing').subscribe(() => {
      this.isActiveDrawer = false;
    });
  }

  private setupCanvas() {
    if (!this.isBrowser) return;

    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;

    this.resizeCanvas();
    this.saveState();

    canvas.addEventListener('mousedown', this.startDrawing.bind(this));
    canvas.addEventListener('mousemove', this.draw.bind(this));
    canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
    canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
    window.addEventListener('resize', this.resizeCanvas.bind(this));
  }

  private resizeCanvas() {
    if (!this.isBrowser || !this.ctx) return;

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  private getMousePos(event: MouseEvent) {
    if (!this.isBrowser) return { x: 0, y: 0 };

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const scaleX = this.canvasRef.nativeElement.width / rect.width;
    const scaleY = this.canvasRef.nativeElement.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  private startDrawing(event: MouseEvent) {
    if (!this.isBrowser || !this.isActiveDrawer || !this.ctx) return;

    this.isDrawing = true;
    const pos = this.getMousePos(event);
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
    this.emitDrawEvent(pos.x, pos.y, 'start');
  }

  private draw(event: MouseEvent) {
    if (!this.isBrowser || !this.isActiveDrawer || !this.isDrawing || !this.ctx)
      return;

    const pos = this.getMousePos(event);

    this.ctx.strokeStyle = this.tool === 'eraser' ? '#FFFFFF' : this.color;
    this.ctx.lineWidth = this.brushSize;
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();

    this.emitDrawEvent(pos.x, pos.y, 'draw');
  }

  private stopDrawing() {
    if (!this.isBrowser || !this.isActiveDrawer || !this.isDrawing || !this.ctx)
      return;

    this.ctx.closePath();
    this.isDrawing = false;
    this.saveState();
    this.emitDrawEvent(0, 0, 'end');
  }

  private emitDrawEvent(x: number, y: number, type: 'start' | 'draw' | 'end') {
    if (!this.isBrowser) return;

    this.websocketService.emit('draw', {
      x,
      y,
      color: this.color,
      brushSize: this.brushSize,
      tool: this.tool,
      type,
    });
  }

  setColor(event: Event) {
    if (!this.isBrowser) return;
    this.color = (event.target as HTMLInputElement).value;
  }

  setBrushSize(event: Event) {
    if (!this.isBrowser) return;
    this.brushSize = parseInt((event.target as HTMLInputElement).value);
  }

  setTool(tool: string) {
    if (!this.isBrowser) return;
    this.tool = tool;
  }

  fill() {
    if (!this.isBrowser || !this.isActiveDrawer || !this.ctx) return;

    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(
      0,
      0,
      this.canvasRef.nativeElement.width,
      this.canvasRef.nativeElement.height
    );
    this.saveState();
    this.websocketService.emit('fill', { color: this.color });
  }

  undo() {
    if (!this.isBrowser || !this.isActiveDrawer || !this.ctx) return;

    if (this.undoStack.length > 1) {
      this.redoStack.push(this.undoStack.pop()!);
      const imageData = this.undoStack[this.undoStack.length - 1];
      this.ctx.putImageData(imageData, 0, 0);
      this.websocketService.emit('undo', {});
    }
  }

  redo() {
    if (!this.isBrowser || !this.isActiveDrawer || !this.ctx) return;

    if (this.redoStack.length > 0) {
      const imageData = this.redoStack.pop()!;
      this.ctx.putImageData(imageData, 0, 0);
      this.undoStack.push(imageData);
      this.websocketService.emit('redo', {});
    }
  }

  private drawFromSocket(data: any) {
    if (!this.isBrowser || this.isActiveDrawer || !this.ctx) return;

    if (data.type === 'start') {
      this.ctx.beginPath();
      this.ctx.moveTo(data.x, data.y);
    } else if (data.type === 'draw') {
      this.ctx.strokeStyle = data.tool === 'eraser' ? '#FFFFFF' : data.color;
      this.ctx.lineWidth = data.brushSize;
      this.ctx.lineTo(data.x, data.y);
      this.ctx.stroke();
    } else if (data.type === 'end') {
      this.ctx.closePath();
    }
  }

  private fillFromSocket(data: any) {
    if (!this.isBrowser || this.isActiveDrawer || !this.ctx) return;

    this.ctx.fillStyle = data.color;
    this.ctx.fillRect(
      0,
      0,
      this.canvasRef.nativeElement.width,
      this.canvasRef.nativeElement.height
    );
  }

  private undoFromSocket() {
    if (!this.isBrowser || this.isActiveDrawer || !this.ctx) return;

    if (this.undoStack.length > 1) {
      this.redoStack.push(this.undoStack.pop()!);
      const imageData = this.undoStack[this.undoStack.length - 1];
      this.ctx.putImageData(imageData, 0, 0);
    }
  }

  private redoFromSocket() {
    if (!this.isBrowser || this.isActiveDrawer || !this.ctx) return;

    if (this.redoStack.length > 0) {
      const imageData = this.redoStack.pop()!;
      this.ctx.putImageData(imageData, 0, 0);
      this.undoStack.push(imageData);
    }
  }

  private saveState() {
    if (!this.isBrowser || !this.ctx) return;

    const imageData = this.ctx.getImageData(
      0,
      0,
      this.canvasRef.nativeElement.width,
      this.canvasRef.nativeElement.height
    );
    this.undoStack.push(imageData);
    this.redoStack = [];
  }
}
