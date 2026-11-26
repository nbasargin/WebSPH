import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SimController } from '../controller';

@Component({
  selector: 'sph-sim-options',
  imports: [FormsModule],
  template: `
    <div class="settings-block">
      <h6>Simulation options</h6>

      <div class="settings-left middle">Integrator:</div>
      <div class="settings-right middle">
        @for (i of integrators; track i.value; let last = $last) {
          <label>
            <input
              type="radio"
              class="radiobutton"
              name="integrator"
              [value]="i.value"
              [ngModel]="c.integrator()"
              (ngModelChange)="c.setIntegrator($event)"
            />
            {{ i.label }}
          </label>
          @if (!last) {
            <br />
          }
        }
      </div>
      <br />

      <div class="settings-left">Smoothing length:</div>
      <div class="settings-right">
        <div style="display: inline-block; width: 70px">{{ c.smoothingLength() }}</div>
        <input
          class="slider"
          type="range"
          min="0.001"
          max="0.1"
          step="0.001"
          title="simulation smoothing length"
          [ngModel]="c.smoothingLength()"
          (ngModelChange)="c.setSmoothingLength($event)"
        />
      </div>
      <br />

      <div class="settings-left middle">Boundary:</div>
      <div class="settings-right middle">
        <label>
          <input
            type="radio"
            class="radiobutton"
            name="boundary"
            value="cyclic"
            [ngModel]="c.boundary()"
            (ngModelChange)="c.setBoundary($event)"
          />
          Cyclic
        </label>
        <br />
        <label>
          <input
            type="radio"
            class="radiobutton"
            name="boundary"
            value="solid"
            [ngModel]="c.boundary()"
            (ngModelChange)="c.setBoundary($event)"
          />
          Solid
        </label>
      </div>
    </div>
  `,
})
export class SimOptionsComponent {
  protected readonly c = inject(SimController);
  protected readonly integrators = [
    { value: 'euler', label: 'Euler' },
    { value: 'heunNaive', label: 'Heun (naive)' },
    { value: 'heunStd', label: 'Heun (standard)' },
    { value: 'heunFast', label: 'Heun (fast)' },
  ] as const;
}
