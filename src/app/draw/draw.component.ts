import { AfterViewInit, Component, computed, ElementRef, HostListener, inject, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Toast } from '@capacitor/toast';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, debounceTime, Subscription, timer } from 'rxjs';
import { AppStore } from 'src/app/store/app.store';
import { CrayonBrush } from './brushes/CrayonBrush';
import { MarkerBrush } from 'src/app/draw/brushes/MarkerBrush';


@Component({
  selector: 'app-draw',
  standalone: false,
  templateUrl: './draw.component.html',
  styleUrls: ['./draw.component.css'],
})
export class DrawComponent implements OnInit, AfterViewInit, OnDestroy {

  store = inject(AppStore);
  route = inject(ActivatedRoute);

  datas = this.store.datas;

  @ViewChild('canvas')
  canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('preview')
  preview!: ElementRef<HTMLDivElement>;

  private ctx!: CanvasRenderingContext2D;
  private image!: HTMLImageElement;
  private closePreviewSubscription!: Subscription;

  id = signal('');
  data = computed(() => {
    return this.datas().find((item) => item.id === this.id());
  });

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
  // 屏幕尺寸
  screenWidth = signal(window.innerWidth);
  screenHeight = signal(window.innerHeight);

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
  brush!: MarkerBrush;
  downloading = signal(false);

  constructor() {
    this.closePreviewSubscription = this.closePreview$.subscribe(() => {
      this.showPreview.set(false);
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.id.set(id);
  }
  ngAfterViewInit() {
    const canvas = this.canvas.nativeElement;
    const context = canvas.getContext('2d');
    if (context) {
      this.loadImg(this.data()?.image || '');
    }

    const crayonBrush = new MarkerBrush(canvas, {
      width: this.penWidth(),
      color: this.activeColor(),
    });
    this.brush = crayonBrush;
  }
  ngOnDestroy() {
    this.closePreviewSubscription.unsubscribe();
  }

  selectColor(color: string) {
    this.activeColor.set(color);
    this.brush.setColor(color);
    this.drawPreview();
  }
  setLineWidth(width: number) {
    this.penWidth.set(width);
    this.brush.setWidth(width);
    this.drawPreview();
  }

  loadImg(src: string) {
    this.image = new Image();
    this.image.onload = () => {
      this.canvas.nativeElement.width = this.canvasWidth();
      this.canvas.nativeElement.height = this.canvasHeight();
      // 这里设置缩放，将图片缩放为画布大小
      this.ctx = this.canvas.nativeElement.getContext('2d')!;
      this.ctx.drawImage(this.image, 0, 0, this.canvasWidth(), this.canvasHeight());
    }
    this.image.src = src;
  }

  @HostListener('document:mouseup', ['$event'])
  @HostListener('document:touchend', ['$event'])
  onUp(event: MouseEvent | TouchEvent) {
    if (event.target === this.canvas.nativeElement) {
      this.brush.onMouseUp();
    }
  }

  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  onMove(event: MouseEvent | TouchEvent) {
    if (event.target === this.canvas.nativeElement && this.brush.isDrawing()) {
      const rect = this.canvas.nativeElement.getBoundingClientRect();
      this.brush.onMouseMove(event instanceof MouseEvent ? event.clientX - rect.left : event.touches[0].clientX - rect.left, event instanceof MouseEvent ? event.clientY - rect.top : event.touches[0].clientY - rect.top);
    }
  }

  @HostListener('document:mousedown', ['$event'])
  @HostListener('document:touchstart', ['$event'])
  onDown(event: MouseEvent | TouchEvent) {
    if (event.target === this.canvas.nativeElement) {
      const rect = this.canvas.nativeElement.getBoundingClientRect();
      this.brush.onMouseDown(event instanceof MouseEvent ? event.clientX - rect.left : event.touches[0].clientX - rect.left, event instanceof MouseEvent ? event.clientY - rect.top : event.touches[0].clientY - rect.top);
    }

  }

  undo() {
    this.brush.undo();
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
    const canvas = this.canvas.nativeElement;
    const image = canvas.toDataURL('image/png');
    const base64Data = image.split(',')[1];
    const fileName = `drawing_${new Date().getTime()}.png`;

    await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Documents
    });

    // 在Android上显示下载完成通知
    await Toast.show({
      text: '图片已保存到文档目录',
      duration: 'short'
    });
  }
  private async webDownload() {
    const canvas = this.canvas.nativeElement;
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

