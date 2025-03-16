import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateMinimalProfileComponent } from './update-minimal-profile.component';

describe('UpdateMinimalProfileComponent', () => {
  let component: UpdateMinimalProfileComponent;
  let fixture: ComponentFixture<UpdateMinimalProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateMinimalProfileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateMinimalProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
