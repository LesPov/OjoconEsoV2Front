import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampesinoDashboardComponent } from './campesino-dashboard.component';

describe('CampesinoDashboardComponent', () => {
  let component: CampesinoDashboardComponent;
  let fixture: ComponentFixture<CampesinoDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CampesinoDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CampesinoDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
