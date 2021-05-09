import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataCardSmallComponent } from './data-card-small.component';

describe('DataCardSmallComponent', () => {
  let component: DataCardSmallComponent;
  let fixture: ComponentFixture<DataCardSmallComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataCardSmallComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataCardSmallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
