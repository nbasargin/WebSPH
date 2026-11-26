import { afterNextRender, Component, ElementRef, inject, viewChild } from '@angular/core';
import { version } from '../../../package.json';
import { SimController } from './controller';
import { RenderingComponent } from './settings/rendering';
import { ScenarioComponent } from './settings/scenario';
import { SimControlComponent } from './settings/sim-control';
import { SimOptionsComponent } from './settings/sim-options';
import { TimeSteppingComponent } from './settings/time-stepping';

/** Original UI from the thesis (v0.9.2), same look and functionality. */
@Component({
  selector: 'sph-page-original',
  preserveWhitespaces: true, // as in the original Angular 4 UI
  imports: [ScenarioComponent, SimControlComponent, SimOptionsComponent, TimeSteppingComponent, RenderingComponent],
  providers: [SimController],
  template: `
    <div class="root">
      <h1 style="display: inline">WebSPH</h1>
      <span style="font-size: 8pt; margin-right: 15px"> v{{ version }}</span>
      <h2 style="display: inline-block; width: auto">1D Shallow Water Equations</h2>

      <div class="scalable-wrapper">
        <canvas #canvas class="scaled-content" style="background-color: white"></canvas>
      </div>

      <div class="settings-container">
        <sph-scenario />
        <sph-sim-control />
        <sph-sim-options />
        <sph-time-stepping />
        <sph-rendering />
      </div>
    </div>
  `,
})
export class PageOriginalComponent {
  protected readonly version = version;
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly controller = inject(SimController);

  constructor() {
    afterNextRender(() => this.controller.init(this.canvas().nativeElement));
  }
}
