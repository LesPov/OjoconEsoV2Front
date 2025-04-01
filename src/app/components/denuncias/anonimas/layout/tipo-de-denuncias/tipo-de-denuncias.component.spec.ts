import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoDeDenunciasComponent } from './tipo-de-denuncias.component';

describe('TipoDeDenunciasComponent', () => {
  let component: TipoDeDenunciasComponent;
  let fixture: ComponentFixture<TipoDeDenunciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipoDeDenunciasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoDeDenunciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
