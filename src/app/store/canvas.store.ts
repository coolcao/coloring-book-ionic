import { computed, effect, Injectable, linkedSignal, signal } from "@angular/core";
import { CrayonBrush } from "src/app/draw/brushes/CrayonBrush";
import { MarkerBrush } from "src/app/draw/brushes/MarkerBrush";

export enum BrushType {
  Crayon = 'crayon',
  Marker = 'marker'
};

@Injectable({
  providedIn: 'root'
})
export class CanvasStore {

  constructor() {
    effect(() => {
      if (this.activeColor()) {
        if (this._crayonBrush()) {
          this._crayonBrush.update(brush => {
            if (brush) {
              brush.setColor(this.activeColor());
            }
            return brush;
          })
        }
        if (this._markerBrush()) {
          this._markerBrush.update(brush => {
            if (brush) {
              brush.setColor(this.activeColor());
            }
            return brush;
          })
        }
      }
      if (this.penWidth()) {
        if (this._crayonBrush()) {
          this._crayonBrush.update(brush => {
            if (brush) {
              brush.setWidth(this.penWidth());
            }
            return brush;
          })
        }
        if (this._markerBrush()) {
          this._markerBrush.update(brush => {
            if (brush) {
              brush.setWidth(this.penWidth());
            }
            return brush;
          })
        }
      }
    });
  }

  private _canvas = signal<HTMLCanvasElement | null>(null);
  private _brushType = signal<BrushType>(BrushType.Crayon);
  private _penWidth = signal<number>(10);
  private _activeColor = signal<string>('#000000');
  private _crayonBrush = linkedSignal(() => {
    if (this.canvas()) {
      return new CrayonBrush(this.canvas()!, {
        color: this.activeColor(),
        width: this.penWidth(),
        opacity: 0.5,
        sep: 3,
      });
    }
    return null;
  });
  private _markerBrush = linkedSignal(() => {
    if (this.canvas()) {
      return new MarkerBrush(this.canvas()!, {
        color: this.activeColor(),
        width: this.penWidth(),
        opacity: 0.3,
      });
    }
    return null;
  });
  private _drawHistory = signal<ImageData[]>([]);

  canvas = this._canvas.asReadonly();
  brushType = this._brushType.asReadonly();
  ctx = computed(() => {
    if (this.canvas()) {
      return this.canvas()!.getContext('2d');
    }
    return null;
  });
  activeColor = this._activeColor.asReadonly();
  penWidth = this._penWidth.asReadonly();
  brush = computed(() => {
    if (this.brushType() === BrushType.Crayon) {
      return this._crayonBrush();
    }
    return this._markerBrush();
  });
  drawHistory = this._drawHistory.asReadonly();

  initCanvas(canvas: HTMLCanvasElement) {
    this._canvas.set(canvas);
    this.saveState();
  }

  clear() {
    if (!this.ctx()) {
      return;
    }
    this.ctx()?.clearRect(0, 0, this.canvas()!.width, this.canvas()!.height);
    this._drawHistory.set([]);
  }

  undo() {
    if (this.drawHistory().length <= 1) {
      return;
    }
    const history = this.drawHistory();
    const prev = history.pop();
    if (prev) {
      this.ctx()?.putImageData(prev, 0, 0);
    }
    this._drawHistory.set([...history]);
  }

  saveState() {
    if (!this.ctx()) {
      return;
    }
    if (this.drawHistory().length >= 20) {
      this._drawHistory.update(history => {
        history.shift();
        return [...history];
      });
    }

    const imageData = this.ctx()?.getImageData(0, 0, this.canvas()!.width, this.canvas()!.height);
    this._drawHistory.update(history => {
      history.push(imageData!);
      return [...history];
    });

  }

  setActiveColor(color: string) {
    this._activeColor.set(color);
  }
  setPenWidth(width: number) {
    this._penWidth.set(width);
  }
  setBrushType(type: BrushType) {
    this._brushType.set(type);
  }




}
