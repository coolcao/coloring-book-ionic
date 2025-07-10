import { AfterViewInit, Component, computed, effect, ElementRef, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Toast } from '@capacitor/toast';
import { Canvas, SprayBrush, FabricObject, FabricImage } from 'fabric';
import { BehaviorSubject, debounceTime, timer } from 'rxjs';
import { AppStore } from 'src/app/store/app.store';

@Component({
  selector: 'app-fabric-draw',
  standalone: false,
  templateUrl: './fabric-draw.component.html',
  styleUrls: ['./fabric-draw.component.css'],
})
export class FabricDrawComponent implements OnInit, AfterViewInit {

  store = inject(AppStore);
  route = inject(ActivatedRoute);

  datas = this.store.datas;

  downloading = signal(false);

  colors = [
    { hex: '#000000', name: '黑色' },
    { hex: '#4B0082', name: '深紫' },
    { hex: '#800000', name: '深红' },
    { hex: '#8B4513', name: '深棕' },
    { hex: '#2F4F4F', name: '深灰' },
    { hex: '#006400', name: '深绿' },
    { hex: '#00008B', name: '深蓝' },
    { hex: '#8B0000', name: '酒红' },
    { hex: '#FF0000', name: '红色' },
    { hex: '#FF8C00', name: '橙色' },
    { hex: '#FFD700', name: '金黄' },
    { hex: '#FFFF00', name: '黄色' },
    { hex: '#ADFF2F', name: '草绿' },
    { hex: '#32CD32', name: '鲜绿' },
    { hex: '#40E0D0', name: '青绿' },
    { hex: '#00CED1', name: '碧蓝' },
    { hex: '#1E90FF', name: '天蓝' },
    { hex: '#87CEFA', name: '浅蓝' },
    { hex: '#BA55D3', name: '紫罗兰' },
    { hex: '#DDA0DD', name: '浅紫' },
    { hex: '#FFC0CB', name: '粉色' },
    { hex: '#FFE4B5', name: '米色' },
    { hex: '#D3D3D3', name: '浅灰' },
    { hex: '#FFFFFF', name: '白色' }
  ];

  screenWidth = signal(window.innerWidth);
  screenHeight = signal(window.innerHeight);

  id = signal('');
  data = computed(() => {
    return this.datas().find((item) => item.id === this.id());
  });
  // 画布尺寸
  canvasWidth = computed(() => {
    const minScreen = Math.min(this.screenWidth(), this.screenHeight());
    if (minScreen > 768) {
      return minScreen - 200;
    }
    if (minScreen > 480) {
      return minScreen - 100;
    }
    return minScreen - 20;
  });
  canvasHeight = computed(() => {
    const minScreen = Math.min(this.screenWidth(), this.screenHeight());
    if (minScreen > 768) {
      return minScreen - 200;
    }
    if (minScreen > 480) {
      return minScreen - 100;
    }
    return minScreen - 20;
  });

  activeColor = signal(this.colors[0].hex);
  penWidth = signal(10);
  showPreview = signal(false);
  closePreview$ = new BehaviorSubject(false);


  @ViewChild('canvas')
  canvasRef!: ElementRef<HTMLCanvasElement>;
  canvas!: Canvas;

  constructor() {

    effect(() => {
      if (this.activeColor()) {
        if (this.canvas && this.canvas.freeDrawingBrush) {
          this.canvas.freeDrawingBrush.color = this.activeColor();
        }
      }
    });

    this.closePreview$.pipe(debounceTime(1000)).subscribe(() => {
      this.showPreview.set(false);
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.id.set(id);
  }

  ngAfterViewInit(): void {
    const canvas = new Canvas(this.canvasRef.nativeElement, { isDrawingMode: true });
    const sprayBrush = new SprayBrush(canvas);
    sprayBrush.density = 20;
    sprayBrush.color = this.activeColor();
    sprayBrush.width = this.penWidth();
    sprayBrush.randomOpacity = true;

    canvas.freeDrawingBrush = sprayBrush;
    FabricObject.prototype.transparentCorners = false;

    this.canvas = canvas;

    this.loadImg(this.data()?.image || '');

  }

  selectColor(color: string) {
    this.activeColor.set(color);
    this.drawPreview();
  }
  setLineWidth(width: number) {
    this.penWidth.set(width);
    this.drawPreview();
  }

  loadImg(src: string) {
    // 加载图片到fabric
    const image = new Image();
    image.src = src;
    image.onload = () => {
      const fabricImage = new FabricImage(image);
      fabricImage.set({
        left: 0,
        top: 0,
      });
      const scale = Math.min(this.canvasWidth() / image.width, this.canvasHeight() / image.height);
      fabricImage.scale(scale);
      this.canvas.add(fabricImage);
    };
  }

  undo() {
    if (this.canvas._objects.length > 0) {
      this.canvas._objects.pop();
      this.canvas.renderAll();
    }
  }

  async downloadDrawing() {
    this.downloading.set(true);
    if (this.store.platform() === 'web') {
      await this.webDownload();
    } else {
      await this.appDownload();
    }
    this.downloading.set(false);
  }

  private async appDownload() {
    const dataURL = this.canvas.toDataURL({ format: 'png', multiplier: 2 });
    const base64Data = dataURL.split(',')[1];
    const fileName = `drawing_${new Date().getTime()}.png`;
    try {
      await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents,
      });
      await Toast.show({ text: '图片已保存到文档目录', duration: 'short' });
    } catch (error) {
      console.error('保存图片失败:', error);
      await Toast.show({ text: '保存图片失败', duration: 'short' });
      await Toast.show({ text: `${error}` })
    }

  }
  private async webDownload() {
    const canvas = this.canvasRef.nativeElement;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `drawing_${new Date().getTime()}.png`;
    link.click();
  }

  private drawPreview() {
    this.showPreview.set(true);
    timer(1500).subscribe(() => {
      this.closePreview$.next(true);
    });
  }

}
