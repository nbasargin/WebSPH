import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SimController } from '../controller';

@Component({
  selector: 'sph-sim-control',
  imports: [FormsModule],
  template: `
    <div class="settings-block">
      <h6>Simulation control</h6>

      <div class="settings-left">Simulation time:</div>
      <div class="settings-right">
        {{ c.totalTime().toFixed(4) }}
        {{ c.maxTimeEnabled() && c.parsedMaxTime() > 0 ? ' of ' + c.parsedMaxTime() : '' }} seconds
      </div>
      <br />

      <div class="settings-left">
        <button class="button" (click)="c.toggleRunning()">{{ c.running() ? 'Stop' : 'Start' }}</button>
      </div>
      <div class="settings-right">
        <label>
          <input
            type="checkbox"
            class="checkbox"
            [ngModel]="c.maxTimeEnabled()"
            (ngModelChange)="c.setMaxTimeEnabled($event)"
          />
          {{ c.maxTimeEnabled() ? 'Run until:' : 'Set maximal time' }}
        </label>
        @if (c.maxTimeEnabled()) {
          <input
            type="text"
            style="display: inline; width: 80px"
            maxlength="7"
            title="maximal time"
            [ngModel]="c.maxTimeInput()"
            (ngModelChange)="c.setMaxTimeInput($event)"
          />
        }
      </div>
      <br />

      @if (!c.running()) {
        <div class="settings-left">
          <button class="button" (click)="c.doSteps()">Do steps</button>
        </div>
        <div class="settings-right">
          <select
            class="select"
            title="number of steps"
            [ngModel]="c.numSteps()"
            (ngModelChange)="c.numSteps.set($event)"
          >
            @for (steps of stepValues; track steps) {
              <option [ngValue]="steps">{{ steps }}</option>
            }
          </select>
          step(s)
        </div>
        <br />

        <div class="settings-left">
          <button class="button" (click)="c.reset()">Reset</button>
        </div>
        <div class="settings-right">
          <select
            class="select"
            title="number of particles"
            [ngModel]="c.numParticles()"
            (ngModelChange)="c.numParticles.set($event)"
          >
            @for (ps of particleValues; track ps) {
              <option [ngValue]="ps">{{ ps }}</option>
            }
          </select>
          particles
        </div>
      } @else {
        <br />
      }
    </div>
  `,
})
export class SimControlComponent {
  protected readonly c = inject(SimController);
  protected readonly stepValues = [1, 2, 5, 10, 20, 50, 100];
  protected readonly particleValues = [1, 10, 50, 100, 200, 300, 500, 750, 1000, 1500, 2000, 3000, 5000];
}
