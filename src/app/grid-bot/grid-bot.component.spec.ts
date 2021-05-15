import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridBotComponent } from './grid-bot.component';

describe('GridBotComponent', () => {
  let component: GridBotComponent;
  let fixture: ComponentFixture<GridBotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GridBotComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GridBotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
