import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterCampesinoComponent } from './register-campesino.component';

describe('RegisterCampesinoComponent', () => {
  let component: RegisterCampesinoComponent;
  let fixture: ComponentFixture<RegisterCampesinoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterCampesinoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterCampesinoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
