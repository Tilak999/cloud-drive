import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataCardFullComponent } from './data-card-full.component';

describe('DataCardFullComponent', () => {
  let component: DataCardFullComponent;
  let fixture: ComponentFixture<DataCardFullComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DataCardFullComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DataCardFullComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
