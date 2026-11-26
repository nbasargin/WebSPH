import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SimController } from '../controller';

@Component({
  selector: 'sph-rendering',
  preserveWhitespaces: true, // as in the original Angular 4 UI
  imports: [FormsModule],
  template: `
    <div class="settings-block">
      <h6>Rendering</h6>

      <div class="settings-left">Average FPS:</div>
      <div class="settings-right">{{ c.fps().toFixed(2) }}</div>
      <br />

      <div class="settings-left middle">Visualization smoothing length:</div>
      <div class="settings-right middle">
        <div style="display: inline-block; width: 70px">{{ c.visuSmoothingLength() }}</div>
        <input
          class="slider"
          type="range"
          min="0.001"
          max="0.1"
          step="0.001"
          title="visual smoothing length"
          [ngModel]="c.visuSmoothingLength()"
          (ngModelChange)="c.setVisuSmoothingLength($event)"
        />
      </div>
      <br />

      <div class="settings-left">Particle size:</div>
      <div class="settings-right">
        <select
          class="select"
          title="visual particle size"
          [ngModel]="c.particleSize()"
          (ngModelChange)="c.setParticleSize($event)"
        >
          @for (size of sizes; track size) {
            <option [ngValue]="size">{{ size == 0 ? 'hidden' : size }}</option>
          }
        </select>
      </div>
    </div>
  `,
})
export class RenderingComponent {
  protected readonly c = inject(SimController);
  protected readonly sizes = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
}
