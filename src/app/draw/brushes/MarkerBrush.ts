interface Point {
  x: number;
  y: number;
}

interface MarkerBrushOptions {
  color?: string;
  opacity?: number;
  width?: number;
}

class MarkerBrush {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  // Brush properties
  private color: string;
  private opacity: number;
  private width: number;

  // Internal state
  private _baseWidth: number = 10;
  private _lastPoint: Point | null = null;
  private _lineWidth: number = 3;
  private _point: Point = { x: 0, y: 0 };
  private _size: number = 0;
  private _isDrawing: boolean = false;

  // Undo functionality
  private _drawingHistory: ImageData[] = [];
  private _maxHistorySteps: number = 20;

  constructor(canvas: HTMLCanvasElement, options: MarkerBrushOptions = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D context from canvas');
    }
    this.ctx = ctx;

    // Set options with defaults
    this.color = options.color || '#000';
    this.opacity = options.opacity ?? 1;
    this.width = options.width || 30;

    // Setup canvas context
    this.ctx.lineJoin = 'round';
    this.ctx.lineCap = 'round';
    this.ctx.globalAlpha = this.opacity;

    // 记录初始状态
    this._saveState();
  }

  private _render(pointer: Point): void {
    const ctx = this.ctx;
    ctx.beginPath();

    const len = (this._size / this._lineWidth) / 2;
    for (let i = 0; i < len; i++) {
      const lineWidthDiff = (this._lineWidth - 1) * i;

      ctx.globalAlpha = 0.8 * this.opacity;
      if (this._lastPoint) {
        ctx.moveTo(this._lastPoint.x + lineWidthDiff, this._lastPoint.y + lineWidthDiff);
        ctx.lineTo(pointer.x + lineWidthDiff, pointer.y + lineWidthDiff);
        ctx.stroke();
      }
    }

    this._lastPoint = { ...pointer };
  }

  public onMouseDown(x: number, y: number): void {
    // 开始新笔画前保存状态
    this._saveState();
    
    this._isDrawing = true;
    this._lastPoint = { x, y };
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this._lineWidth;
    this._size = this.width + this._baseWidth;
  }

  public onMouseMove(x: number, y: number): void {
    if (this._isDrawing && this._lastPoint) {
      this._render({ x, y });
    }
  }

  public onMouseUp(): void {
    this.ctx.globalAlpha = this.opacity;
    this.ctx.globalAlpha = 1;
    this._isDrawing = false;
  }

  // Helper methods for DOM event binding
  public start(x: number, y: number): void {
    this.onMouseDown(x, y);
  }

  public move(x: number, y: number): void {
    this.onMouseMove(x, y);
  }

  public end(): void {
    this.onMouseUp();
  }

  public isDrawing(): boolean {
    return this._isDrawing;
  }

  // Getters and setters for brush properties
  public getColor(): string {
    return this.color;
  }

  public setColor(color: string): void {
    this.color = color;
  }

  public getOpacity(): number {
    return this.opacity;
  }

  public setOpacity(opacity: number): void {
    this.opacity = opacity;
    this.ctx.globalAlpha = opacity;
  }

  public getWidth(): number {
    return this.width;
  }

  public setWidth(width: number): void {
    this.width = width;
  }

  public undo(): void {
    if (this._drawingHistory.length <= 1) {
      // 没有可撤销的操作
      return;
    }

    // 移除当前状态
    const previousState = this._drawingHistory.pop();
    // 恢复到上一个状态
    if (previousState) {
      this.ctx.putImageData(previousState, 0, 0);
    }
  }

  private _saveState(): void {
    // 限制历史记录数量
    if (this._drawingHistory.length >= this._maxHistorySteps) {
      this._drawingHistory.shift();
    }

    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    this._drawingHistory.push(imageData);
  }
}

// Export types and class for module usage
export type { Point, MarkerBrushOptions };
export { MarkerBrush };
