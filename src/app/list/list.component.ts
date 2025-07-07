import { Component, inject, OnInit } from '@angular/core';
import { AppStore } from 'src/app/store/app.store';

@Component({
  selector: 'app-list',
  standalone: false,
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css'],
})
export class ListComponent implements OnInit {

  store = inject(AppStore);

  datas = this.store.datas;

  constructor() { }

  ngOnInit() { }

}
