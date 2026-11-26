import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { scenarios } from '../../../sph/original/scenarios/scenarios';
import { SimController } from '../controller';

@Component({
  selector: 'sph-scenario',
  preserveWhitespaces: true, // as in the original Angular 4 UI
  imports: [FormsModule],
  template: `
    <div class="settings-block">
      <h6>Scenario</h6>
      <select
        class="select"
        style="width: 180px"
        title="select a scenario"
        [ngModel]="c.selectedScenario()"
        (ngModelChange)="c.selectedScenario.set($event)"
      >
        @for (s of scenarios; track s.name) {
          <option [ngValue]="s">{{ s.name }}</option>
        }
      </select>

      <button class="button" (click)="c.applyScenario(c.selectedScenario())">Select</button>
      <br />

      <div style="margin-top: 2px">
        Description: <i>{{ c.selectedScenario().description }}</i>
      </div>
    </div>
  `,
})
export class ScenarioComponent {
  protected readonly c = inject(SimController);
  protected readonly scenarios = scenarios;
}
