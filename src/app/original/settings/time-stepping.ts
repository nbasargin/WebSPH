import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SimController } from '../controller';

@Component({
  selector: 'sph-time-stepping',
  preserveWhitespaces: true, // as in the original Angular 4 UI
  imports: [FormsModule],
  template: `
    <div class="settings-block">
      <h6>Time stepping</h6>

      <div class="settings-left">Next time step:</div>
      <div class="settings-right">
        <div style="display: inline-block; width: 70px">
          <b>{{ c.dtNext().toFixed(4) }}</b>
        </div>
      </div>
      <br />

      <div class="settings-left">
        <label>
          <input
            type="radio"
            class="radiobutton"
            value="fixed"
            name="timestep-type"
            [ngModel]="c.dtMode()"
            (ngModelChange)="c.setDtMode($event)"
          />
          Fixed
        </label>
      </div>
      <div class="settings-right">
        <div style="display: inline-block; width: 70px">{{ c.dtFixed().toFixed(4) }}</div>
        <input
          class="slider"
          type="range"
          min="0.0001"
          max="0.01"
          step="0.0001"
          title="fixed time step size"
          [ngModel]="c.dtFixed()"
          (ngModelChange)="c.setDtFixed($event)"
        />
      </div>
      <br />

      <div class="settings-left">
        <label>
          <input
            type="radio"
            class="radiobutton"
            value="dynStable"
            name="timestep-type"
            [ngModel]="c.dtMode()"
            (ngModelChange)="c.setDtMode($event)"
          />
          Dyn. stable
        </label>
      </div>
      <div class="settings-right">
        <div style="display: inline-block; width: 70px">{{ c.dtDynStable().toFixed(4) }}</div>
      </div>
      <br />

      <div class="settings-left">
        <label>
          <input
            type="radio"
            class="radiobutton"
            value="dynFast"
            name="timestep-type"
            [ngModel]="c.dtMode()"
            (ngModelChange)="c.setDtMode($event)"
          />
          Dyn. fast
        </label>
      </div>
      <div class="settings-right">
        <div style="display: inline-block; width: 70px">{{ c.dtDynFast().toFixed(4) }}</div>
      </div>
      <br />

      <div class="settings-left">
        <label>
          <input
            type="checkbox"
            style="margin-top: 5px"
            class="checkbox"
            [ngModel]="c.dtLimitEnabled()"
            (ngModelChange)="c.setDtLimitEnabled($event)"
          />
          {{ c.dtLimitEnabled() ? 'Limit to: ' : 'Set limit' }}
        </label>
      </div>
      @if (c.dtLimitEnabled()) {
        <div class="settings-right">
          <div style="display: inline-block; width: 70px">{{ c.dtLimit().toFixed(4) }}</div>
          <input
            class="slider"
            type="range"
            min="0.0001"
            max="0.01"
            step="0.0001"
            title="time step limit"
            [ngModel]="c.dtLimit()"
            (ngModelChange)="c.setDtLimit($event)"
          />
        </div>
      }
    </div>
  `,
})
export class TimeSteppingComponent {
  protected readonly c = inject(SimController);
}
