import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InicioOficialComponent } from './inicio-oficial.component';

describe('InicioOficialComponent', () => {
  let component: InicioOficialComponent;
  let fixture: ComponentFixture<InicioOficialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioOficialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InicioOficialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
