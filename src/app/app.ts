import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'sph-app',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent {}
