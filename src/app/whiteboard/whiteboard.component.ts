import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Inject,
  HostListener,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { WebsocketService } from '../web-socket.service';
import { PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-whiteboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isBrowser" class="space-y-4">
      <canvas #canvas class="w-full border border-gray-300 rounded-lg"></canvas>
      <div class="flex flex-wrap gap-2 justify-center">
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
    </div>
  `,
})
export class WhiteboardComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  private isDrawing = false;
  private color = '#000000';
  private brushSize = 5;
  private tool = 'brush';
  private undoStack: ImageData[] = [];
  private redoStack: ImageData[] = [];
  public isBrowser: boolean;

  constructor(
    private websocketService: WebsocketService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.websocketService.listen('draw').subscribe((data: any) => {
        this.drawFromSocket(data);
      });

      this.websocketService.listen('undo').subscribe(() => {
        this.undoFromSocket();
      });

      this.websocketService.listen('redo').subscribe(() => {
        this.redoFromSocket();
      });
    }
  }

  ngAfterViewInit() {
    if (this.isBrowser) {
      const canvas = this.canvasRef.nativeElement;
      this.ctx = canvas.getContext('2d')!;
      this.resizeCanvas();
      this.saveState();

      canvas.addEventListener('mousedown', this.startDrawing.bind(this));
      canvas.addEventListener('mousemove', this.draw.bind(this));
      canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
      canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
    }
  }

  @HostListener('window:resize')
  onResize() {
    this.resizeCanvas();
  }

  private resizeCanvas() {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
  }

  private getMousePos(event: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const scaleX = this.canvasRef.nativeElement.width / rect.width;
    const scaleY = this.canvasRef.nativeElement.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  private startDrawing(event: MouseEvent) {
    this.isDrawing = true;
    const pos = this.getMousePos(event);
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
  }

  private draw(event: MouseEvent) {
    if (!this.isDrawing) return;

    const pos = this.getMousePos(event);

    this.ctx.strokeStyle = this.tool === 'eraser' ? '#FFFFFF' : this.color;
    this.ctx.lineWidth = this.brushSize;
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();

    this.websocketService.emit('draw', {
      x: pos.x,
      y: pos.y,
      color: this.color,
      brushSize: this.brushSize,
      tool: this.tool,
    });
  }

  private stopDrawing() {
    if (this.isDrawing) {
      this.ctx.closePath();
      this.isDrawing = false;
      this.saveState();
    }
  }

  private drawFromSocket(data: any) {
    this.ctx.strokeStyle = data.tool === 'eraser' ? '#FFFFFF' : data.color;
    this.ctx.lineWidth = data.brushSize;
    this.ctx.lineTo(data.x, data.y);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(data.x, data.y);
  }

  setColor(event: Event) {
    this.color = (event.target as HTMLInputElement).value;
  }

  setBrushSize(event: Event) {
    this.brushSize = parseInt((event.target as HTMLInputElement).value);
  }

  setTool(tool: string) {
    this.tool = tool;
  }

  fill() {
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
    if (this.undoStack.length > 1) {
      this.redoStack.push(this.undoStack.pop()!);
      const imageData = this.undoStack[this.undoStack.length - 1];
      this.ctx.putImageData(imageData, 0, 0);
      this.websocketService.emit('undo', { action: 'undo' });
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      const imageData = this.redoStack.pop()!;
      this.ctx.putImageData(imageData, 0, 0);
      this.undoStack.push(imageData);
      this.websocketService.emit('redo', { action: 'redo' });
    }
  }

  private undoFromSocket() {
    this.undo();
  }

  private redoFromSocket() {
    this.redo();
  }

  private saveState() {
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
