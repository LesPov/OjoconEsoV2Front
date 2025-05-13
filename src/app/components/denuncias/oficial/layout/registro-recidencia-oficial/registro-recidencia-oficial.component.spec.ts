import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroRecidenciaOficialComponent } from './registro-recidencia-oficial.component';

describe('RegistroRecidenciaOficialComponent', () => {
  let component: RegistroRecidenciaOficialComponent;
  let fixture: ComponentFixture<RegistroRecidenciaOficialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroRecidenciaOficialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroRecidenciaOficialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
