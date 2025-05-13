import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroOficialComponent } from './registro-oficial.component';

describe('RegistroOficialComponent', () => {
  let component: RegistroOficialComponent;
  let fixture: ComponentFixture<RegistroOficialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroOficialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroOficialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
