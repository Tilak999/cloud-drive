import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'data-card-full',
  templateUrl: './data-card-full.component.html',
  styleUrls: ['./data-card-full.component.scss']
})
export class DataCardFullComponent implements OnInit {
  @Input() fileName: string = 'Undefined';

  constructor() { }

  ngOnInit(): void {
  }
}
