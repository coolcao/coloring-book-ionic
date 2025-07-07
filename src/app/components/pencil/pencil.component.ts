import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-pencil',
  standalone: false,
  templateUrl: './pencil.component.html',
  styleUrls: ['./pencil.component.css'],
})
export class PencilComponent implements OnInit {

  @Input()
  color: string = '#000000';

  @Output()
  colorChange = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

  changeColor() {
    this.colorChange.emit(this.color);
  }

}
