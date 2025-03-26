import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InforegisterComponent } from './inforegister.component';

describe('InforegisterComponent', () => {
  let component: InforegisterComponent;
  let fixture: ComponentFixture<InforegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InforegisterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InforegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
