import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InicioAnonimaComponent } from './inicio-anonima.component';

describe('InicioAnonimaComponent', () => {
  let component: InicioAnonimaComponent;
  let fixture: ComponentFixture<InicioAnonimaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioAnonimaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InicioAnonimaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
