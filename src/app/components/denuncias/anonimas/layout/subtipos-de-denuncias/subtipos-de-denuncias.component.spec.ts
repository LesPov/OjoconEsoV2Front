import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubtiposDeDenunciasComponent } from './subtipos-de-denuncias.component';

describe('SubtiposDeDenunciasComponent', () => {
  let component: SubtiposDeDenunciasComponent;
  let fixture: ComponentFixture<SubtiposDeDenunciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubtiposDeDenunciasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubtiposDeDenunciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
