import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'sph-app',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent implements OnInit {
  private readonly router = inject(Router);

  ngOnInit() {
    // GitHub Pages: 404.html stores the requested path and redirects to the app root
    const comingFrom = localStorage.getItem('coming-from');
    if (comingFrom) {
      localStorage.removeItem('coming-from');
      const route = comingFrom.replace(/^WebSPH\//, '/');
      this.router.navigateByUrl(route).catch((error) => console.warn(`Redirect to ${route} failed!`, error));
    }
  }
}
