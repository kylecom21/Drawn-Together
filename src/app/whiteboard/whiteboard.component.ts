import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { WebsocketService } from '../web-socket.service';

@Component({
  selector: 'app-whiteboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="whiteboard-container">
      <canvas #canvas></canvas>
      <div class="tools">
        <input type="color" (change)="setColor($event)" />
        <input type="range" min="1" max="20" (input)="setBrushSize($event)" />
        <button (click)="setTool('brush')">Brush</button>
        <button (click)="setTool('eraser')">Eraser</button>
        <button (click)="fill()">Fill</button>
        <button (click)="undo()">Undo</button>
        <button (click)="redo()">Redo</button>
      </div>
    </div>
  `,
  styles: [
    `
      .whiteboard-container {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      canvas {
        border: 1px solid #000;
      }
      .tools {
        margin-top: 10px;
      }
    `,
  ],
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

  constructor(private websocketService: WebsocketService) {}

  ngOnInit() {
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

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    canvas.width = 800;
    canvas.height = 600;

    canvas.addEventListener('mousedown', this.startDrawing.bind(this));
    canvas.addEventListener('mousemove', this.draw.bind(this));
    canvas.addEventListener('mouseup', this.stopDrawing.bind(this));
    canvas.addEventListener('mouseout', this.stopDrawing.bind(this));
  }

  private startDrawing(event: MouseEvent) {
    this.isDrawing = true;
    this.draw(event);
  }

  private draw(event: MouseEvent) {
    if (!this.isDrawing) return;

    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.ctx.strokeStyle = this.tool === 'eraser' ? '#FFFFFF' : this.color;
    this.ctx.lineWidth = this.brushSize;
    this.ctx.lineCap = 'round';
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);

    this.websocketService.emit('draw', {
      x,
      y,
      color: this.color,
      brushSize: this.brushSize,
      tool: this.tool,
    });
  }

  private stopDrawing() {
    if (this.isDrawing) {
      this.ctx.beginPath();
      this.isDrawing = false;
      this.saveState();
    }
  }

  private drawFromSocket(data: any) {
    this.ctx.strokeStyle = data.tool === 'eraser' ? '#FFFFFF' : data.color;
    this.ctx.lineWidth = data.brushSize;
    this.ctx.lineCap = 'round';
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
    if (this.undoStack.length > 0) {
      const imageData = this.undoStack.pop();
      if (imageData) {
        this.redoStack.push(
          this.ctx.getImageData(
            0,
            0,
            this.canvasRef.nativeElement.width,
            this.canvasRef.nativeElement.height
          )
        );
        this.ctx.putImageData(imageData, 0, 0);
        this.websocketService.emit('undo', { action: 'undo' });
      }
    }
  }

  redo() {
    if (this.redoStack.length > 0) {
      const imageData = this.redoStack.pop();
      if (imageData) {
        this.undoStack.push(
          this.ctx.getImageData(
            0,
            0,
            this.canvasRef.nativeElement.width,
            this.canvasRef.nativeElement.height
          )
        );
        this.ctx.putImageData(imageData, 0, 0);
        this.websocketService.emit('redo', { action: 'redo' });
      }
    }
  }

  private undoFromSocket() {
    if (this.undoStack.length > 0) {
      const imageData = this.undoStack.pop();
      if (imageData) {
        this.redoStack.push(
          this.ctx.getImageData(
            0,
            0,
            this.canvasRef.nativeElement.width,
            this.canvasRef.nativeElement.height
          )
        );
        this.ctx.putImageData(imageData, 0, 0);
      }
    }
  }

  private redoFromSocket() {
    if (this.redoStack.length > 0) {
      const imageData = this.redoStack.pop();
      if (imageData) {
        this.undoStack.push(
          this.ctx.getImageData(
            0,
            0,
            this.canvasRef.nativeElement.width,
            this.canvasRef.nativeElement.height
          )
        );
        this.ctx.putImageData(imageData, 0, 0);
      }
    }
  }

  private saveState() {
    this.undoStack.push(
      this.ctx.getImageData(
        0,
        0,
        this.canvasRef.nativeElement.width,
        this.canvasRef.nativeElement.height
      )
    );
    this.redoStack = [];
  }
}
