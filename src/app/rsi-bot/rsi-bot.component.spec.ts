import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RsiBotComponent } from './rsi-bot.component';

describe('RsiBotComponent', () => {
  let component: RsiBotComponent;
  let fixture: ComponentFixture<RsiBotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RsiBotComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RsiBotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
