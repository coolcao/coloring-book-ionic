import { computed, Injectable, signal } from "@angular/core";
import { list } from "src/app/data";

@Injectable({
  providedIn: 'root'
})
export class AppStore {

  private _showHeader = signal(true);
  private _showFooter = signal(true);
  private _platform = signal('web');
  private _datas = signal(list);

  showHeader = this._showHeader.asReadonly();
  showFooter = this._showFooter.asReadonly();
  platform = this._platform.asReadonly();
  datas = this._datas.asReadonly();

  categorys = computed(() => {
    const categorys = new Set<string>();
    this.datas().forEach(item => {
      categorys.add(item.category);
    });
    return Array.from(categorys);
  });

  setShowHeader(value: boolean) {
    this._showHeader.set(value);
  }
  setShowFooter(value: boolean) {
    this._showFooter.set(value);
  }
  setPlatform(value: string) {
    this._platform.set(value);
  }

}
