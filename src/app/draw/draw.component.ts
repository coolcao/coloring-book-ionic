import { AfterViewInit, Component, computed, ElementRef, HostListener, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, debounceTime, timer } from 'rxjs';
import { AppStore } from 'src/app/store/app.store';

@Component({
  selector: 'app-draw',
  standalone: false,
  templateUrl: './draw.component.html',
  styleUrls: ['./draw.component.css'],
})
export class DrawComponent implements OnInit, AfterViewInit {

  store = inject(AppStore);
  route = inject(ActivatedRoute);

  datas = this.store.datas;

  @ViewChild('canvas')
  canvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('preview')
  preview!: ElementRef<HTMLDivElement>;

  private ctx!: CanvasRenderingContext2D;
  private image!: HTMLImageElement;
  private drawing = false;
  private lastX = 0;
  private lastY = 0;

  id = signal('');
  data = computed(() => {
    return this.datas().find((item) => item.id === this.id());
  });

  colors = [
    { hex: '#000000', name: '黑色' },
    { hex: '#4C0033', name: '深紫色' },
    { hex: '#8B0A1A', name: '深红色' },
    { hex: '#03055B', name: '深蓝色' },
    { hex: '#003300', name: '深绿色' },
    { hex: '#808000', name: '深黄色' },
    { hex: '#FF9900', name: '深橙色' },
    { hex: '#800080', name: '紫色' },
    { hex: '#FF0000', name: '红色' },
    { hex: '#FFA500', name: '橙色' },
    { hex: '#FFFF00', name: '黄色' },
    { hex: '#008000', name: '绿色' },
    { hex: '#0000FF', name: '蓝色' },
    { hex: '#C7B8EA', name: '亮紫色' },
    { hex: '#FFC0C0', name: '亮红色' },
    { hex: '#FFD700', name: '亮橙色' },
    { hex: '#FFFFC0', name: '亮黄色' },
    { hex: '#C6F4D6', name: '亮绿色' },
    { hex: '#ADD8E6', name: '亮蓝色' },
    { hex: '#FFC5C5', name: '淡红色' },
    { hex: '#FFD2C9', name: '淡橙色' },
    { hex: '#FFFFE0', name: '淡黄色' },
    { hex: '#C9E4CA', name: '淡绿色' },
    { hex: '#FFFFFF', name: '白色' }
  ];
  // 屏幕尺寸
  screenWidth = signal(window.innerWidth);
  screenHeight = signal(window.innerHeight);

  // 画布尺寸
  canvasWidth = computed(() => {
    const minScreen = Math.min(this.screenWidth(), this.screenHeight());
    if (minScreen > 768) {
      return minScreen - 280;
    }
    if (minScreen > 480) {
      return minScreen - 100;
    }
    return minScreen - 60;
  });
  canvasHeight = computed(() => {
    const minScreen = Math.min(this.screenWidth(), this.screenHeight());
    if (minScreen > 768) {
      return minScreen - 280;
    }
    if (minScreen > 480) {
      return minScreen - 100;
    }
    return minScreen - 60;
  });

  activeColor = signal(this.colors[0].hex);
  penWidth = signal(10);

  showPreview = signal(false);
  closePreview$ = new BehaviorSubject(false);

  constructor() {
    this.closePreview$.pipe(debounceTime(1000)).subscribe(() => {
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
  onUp() {
    this.drawing = false;
    // 恢复纸张效果
    const paperContainer = this.canvas.nativeElement.parentElement;
    if (paperContainer && paperContainer.classList.contains('paper-container')) {
      paperContainer.style.transform = 'perspective(1000px) rotateX(2deg)';
    }
  }
  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  onMove(event: any) {
    if (this.drawing && event.target === this.canvas.nativeElement) {
      let x, y;
      if (event.type === 'touchmove') {
        // 使用 getBoundingClientRect 获取画布相对于视口的位置
        const rect = this.canvas.nativeElement.getBoundingClientRect();
        x = (event.touches[0].clientX - rect.left);
        y = (event.touches[0].clientY - rect.top);
      } else {
        x = event.offsetX;
        y = event.offsetY;
      }
      this.ctx.beginPath();
      this.ctx.moveTo(this.lastX, this.lastY);
      this.ctx.lineTo(x, y);
      this.ctx.strokeStyle = this.activeColor();
      this.ctx.lineWidth = this.penWidth();
      this.ctx.stroke();
      this.lastX = x;
      this.lastY = y;
    }
  }

  @HostListener('document:mousedown', ['$event'])
  @HostListener('document:touchstart', ['$event'])
  onDown(event: any) {
    if (event.target === this.canvas.nativeElement) {
      this.drawing = true;
      if (event.type === 'touchstart') {
        // 使用 getBoundingClientRect 获取画布相对于视口的位置
        const rect = this.canvas.nativeElement.getBoundingClientRect();
        this.lastX = (event.touches[0].clientX - rect.left);
        this.lastY = (event.touches[0].clientY - rect.top);
      } else {
        this.lastX = event.offsetX;
        this.lastY = event.offsetY;
      }
    }
  }

  private drawPreview() {
    this.showPreview.set(true);
    timer(1500).subscribe(() => {
      this.closePreview$.next(true);
    });
  }

}
