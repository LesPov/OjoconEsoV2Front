import { Component, OnInit, AfterViewInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { navbarData } from './datlinks/navbarData';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, AfterViewInit {

  navData = navbarData;
  isSceneRoute: boolean = false;

  @ViewChildren('listItem') listItems!: QueryList<ElementRef<HTMLLIElement>>;

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Escucha los cambios de ruta para actualizar isSceneRoute
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isSceneRoute = event.urlAfterRedirects.includes('/client/zonas/scene');
      }
    });
  }

  ngAfterViewInit(): void {
    this.listItems.forEach((itemRef: ElementRef) => {
      const liElement = itemRef.nativeElement;
      liElement.addEventListener('click', () => {
        this.listItems.forEach(li => li.nativeElement.classList.remove('active'));
        liElement.classList.add('active');
      });
    });
  }
}
