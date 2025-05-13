import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResumenOficialComponent } from './resumen-oficial.component';

describe('ResumenOficialComponent', () => {
  let component: ResumenOficialComponent;
  let fixture: ComponentFixture<ResumenOficialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResumenOficialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResumenOficialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
