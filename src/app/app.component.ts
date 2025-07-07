import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';

import { Capacitor } from '@capacitor/core';
import { App, BackButtonListenerEvent } from '@capacitor/app';
import { NavigationEnd, Router } from '@angular/router';
import { AppStore } from 'src/app/store/app.store';
import { Location } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
  standalone: false,
})
export class AppComponent implements OnInit {
  router = inject(Router);
  store = inject(AppStore);
  location = inject(Location);
  constructor() { }

  showExit = signal(false);
  showGoback = signal(true);
  showHeader = this.store.showHeader;
  showFooter = this.store.showFooter;

  ngOnInit() {
    this.setupNavigationEvent();
    const platform = this.getPlatform();
    this.store.setPlatform(platform);
    if (platform === 'web') {
      return;
    }
    this.initializeApp();
    this.setupBackEvent();
  }

  // @HostListener('window:popstate', ['$event'])
  // onPopState(event: Event) {
  //   this.goBack();
  // }

  goBack() {
    this.location.back();
  }


  initializeApp() {
    StatusBar.setOverlaysWebView({ overlay: false }); // 关键设置
    // 监听系统主题变化
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)');
    const updateStatusBarColor = (e: MediaQueryListEvent | MediaQueryList) => {
      const isDark = e.matches;
      StatusBar.setBackgroundColor({
        color: isDark ? '#E27A4A' : '#E27A4A'
      });
      StatusBar.setStyle({
        style: isDark ? Style.Dark : Style.Light
      });
    };

    // 初始化状态栏颜色
    updateStatusBarColor(darkMode);
    // 添加主题变化监听
    darkMode.addEventListener('change', updateStatusBarColor);
  }

  exitGame() {
    if (Capacitor.getPlatform() === 'android') {
      (App as any).exitApp(); // 强制退出（Android）
    } else {
      App.minimizeApp(); // iOS 最小化
    }
    this.showExit.set(false);
  }

  setupNavigationEvent() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
    ).subscribe((event: NavigationEnd) => {
      if (event.url === '/' || event.url === '/home') {
        this.showGoback.set(false);
      } else {
        this.showGoback.set(true);
      }
    });
  }

  // 判断当前平台
  getPlatform() {
    // 使用 Capacitor 的 Platforms 来判断当前运行平台
    if (Capacitor.isNativePlatform()) {
      if (Capacitor.getPlatform() === 'android') {
        return 'android';
      } else if (Capacitor.getPlatform() === 'ios') {
        return 'ios';
      }
    }
    return 'web';
  }
  updateStatusBarColor(darkMode: boolean) {
    StatusBar.setBackgroundColor({
      color: darkMode ? '#E27A4A' : '#E27A4A'
    });
    StatusBar.setStyle({
      style: darkMode ? Style.Dark : Style.Light
    });
  }

  private setupBackEvent() {
    App.addListener('backButton', async (event: BackButtonListenerEvent) => {
      if (event.canGoBack) {
        this.goBack();
      } else {
        this.showExit.set(true);
      }
    });
  }
}
