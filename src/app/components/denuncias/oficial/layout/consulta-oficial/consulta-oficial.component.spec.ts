import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaOficialComponent } from './consulta-oficial.component';

describe('ConsultaOficialComponent', () => {
  let component: ConsultaOficialComponent;
  let fixture: ComponentFixture<ConsultaOficialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaOficialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultaOficialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
