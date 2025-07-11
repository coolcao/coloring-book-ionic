interface Point {
  x: number;
  y: number;
}

interface CrayonBrushOptions {
  width?: number;
  color?: string;
  opacity?: number;
  baseWidth?: number;
  inkAmount?: number;
  sep?: number;
}

export class CrayonBrush {
  private _canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private color: string;
  private opacity: number;

  // CrayonBrush specific properties
  private _baseWidth: number;
  private _inkAmount: number;
  private _sep: number;
  private _size: number = 0;

  // Drawing state
  private _point: Point = { x: 0, y: 0 };
  private _latest: Point | null = null;
  private _drawn: boolean = false;
  private _latestStrokeLength: number = 0;

  // Undo functionality
  private _drawingHistory: ImageData[] = [];
  private _maxHistorySteps: number = 20; // 限制历史记录步数以防止内存问题

  constructor(canvas: HTMLCanvasElement, options: CrayonBrushOptions = {}) {
    this._canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas 2D context');
    }
    this.ctx = ctx;

    this.width = options.width || 5;
    this.color = options.color || '#000000';
    this.opacity = options.opacity ?? 0.5;

    // CrayonBrush specific properties with defaults
    this._baseWidth = options.baseWidth ?? 1;
    this._inkAmount = options.inkAmount ?? 10;
    this._sep = options.sep ?? 5;

    // 记录初始状态
    this._saveState();
  }

  setWidth(width: number): void {
    this.width = width;
  }
  setColor(color: string): void {
    this.color = color;
  }
  setOpacity(opacity: number): void {
    this.opacity = opacity;
  }
  setBaseWidth(baseWidth: number): void {
    this._baseWidth = baseWidth;
  }
  setInkAmount(inkAmount: number): void {
    this._inkAmount = inkAmount;
  }
  setSep(sep: number): void {
    this._sep = sep;
  }


  canvas(): HTMLCanvasElement {
    return this._canvas;
  }

  isDrawing(): boolean {
    return this._latest !== null;
  }

  onMouseDown(x: number, y: number): void {
    // 开始新笔画前保存状态
    this._saveState();

    this.ctx.globalAlpha = this.opacity;
    this._size = this.width / 2 + this._baseWidth;
    this._drawn = false;
    this._setPoint(x, y);
  }

  onMouseMove(x: number, y: number): void {
    if (!this._latest) return;
    this._setPoint(x, y);
    this._updateStrokeLength();
    this._draw();
  }

  onMouseUp(): void {

    // if (this._drawn) {
    //   // 笔画结束时保存状态
    //   this._saveState();
    // }
    this._latest = null;
    this._latestStrokeLength = 0;
    this.ctx.globalAlpha = 1;
  }

  // 新增的撤销方法
  undo(): void {
    if (this._drawingHistory.length <= 1) {
      // 没有可撤销的操作
      return;
    }

    // 移除当前状态
    const previousState = this._drawingHistory.pop();
    // 恢复到上一个状态
    // const previousState = this._drawingHistory[this._drawingHistory.length - 1];
    if (previousState) {
      this.ctx.putImageData(previousState, 0, 0);
    }
  }
  // 保存当前画布状态
  private _saveState(): void {
    // 限制历史记录数量
    if (this._drawingHistory.length >= this._maxHistorySteps) {
      this._drawingHistory.shift();
    }

    const imageData = this.ctx.getImageData(0, 0, this.canvas().width, this.canvas().height);
    this._drawingHistory.push(imageData);
  }

  private _setPoint(x: number, y: number): void {
    if (this._latest) {
      this._latest.x = this._point.x;
      this._latest.y = this._point.y;
    } else {
      this._latest = { x, y };
    }
    this._point.x = x;
    this._point.y = y;
  }

  private _updateStrokeLength(): void {
    if (!this._latest) return;

    const dx = this._point.x - this._latest.x;
    const dy = this._point.y - this._latest.y;
    this._latestStrokeLength = Math.sqrt(dx * dx + dy * dy);
  }

  private _draw(): void {
    if (!this._latest) return;

    const v = {
      x: this._point.x - this._latest.x,
      y: this._point.y - this._latest.y
    };

    // Normalize the vector
    const length = Math.sqrt(v.x * v.x + v.y * v.y);
    const s = Math.ceil(this._size / 2);
    const stepNum = Math.floor(length / s) + 1;

    if (length > 0) {
      v.x = v.x / length * s;
      v.y = v.y / length * s;
    }

    const dotSize = this._sep * this._clamp(this._inkAmount / (this._latestStrokeLength + 1), 1, 0.5);
    const dotNum = Math.ceil(this._size * this._sep);
    const range = this._size / 2;

    this.ctx.save();
    this.ctx.fillStyle = this.color;
    this.ctx.beginPath();

    for (let i = 0; i < dotNum; i++) {
      for (let j = 0; j < stepNum; j++) {
        const p = {
          x: this._latest.x + v.x * j,
          y: this._latest.y + v.y * j
        };

        const r = this._random(range);
        const c = this._random(Math.PI * 2);
        const w = this._random(dotSize, dotSize / 2);
        const h = this._random(dotSize, dotSize / 2);

        const x = p.x + r * Math.sin(c) - w / 2;
        const y = p.y + r * Math.cos(c) - h / 2;

        this.ctx.rect(x, y, w, h);
      }
    }

    this.ctx.fill();
    this.ctx.restore();
    this._drawn = true;
  }

  private _random(max: number, min: number = 0): number {
    return Math.random() * (max - min) + min;
  }

  private _clamp(n: number, max: number, min: number = 0): number {
    return n > max ? max : n < min ? min : n;
  }
}
