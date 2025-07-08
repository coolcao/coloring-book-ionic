import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { BehaviorSubject, debounceTime } from 'rxjs';
import { AppStore } from 'src/app/store/app.store';

@Component({
  selector: 'app-list',
  standalone: false,
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class ListComponent implements OnInit {

  store = inject(AppStore);

  categorys = this.store.categorys;
  search$ = new BehaviorSubject('');

  searchCategory = signal('');
  searchText = signal('');

  datas = computed(() => {
    // 根据分类和搜索文本过滤数据
    const category = this.searchCategory();
    const searchText = this.searchText();

    return this.store.datas().filter(item => {
      // 如果没有选择分类和搜索文本，返回所有数据
      if (!category && !searchText) return true;

      // 如果选择了分类，先按分类过滤
      if (category && item.category !== category) return false;

      // 如果有搜索文本，按标题搜索
      if (searchText && !item.name.toLowerCase().includes(searchText.toLowerCase())) return false;

      return true;
    });
  });

  constructor() {
    this.search$.pipe(
      debounceTime(300),
    ).subscribe((searchText) => {
      this.searchText.set(searchText);
    });
  }

  ngOnInit() { }

  search(text: string) {
    this.search$.next(text);
  }

}
