import { Component, EventEmitter, Output } from '@angular/core';
import { CollapsingWaterColumn } from '../../../sph/original/scenarios/collapsing-water-column';
import { ConstantSlope } from '../../../sph/original/scenarios/constant-slope';
import { DryDamBreak } from '../../../sph/original/scenarios/dry-dam-break';
import { DynamicSlope } from '../../../sph/original/scenarios/dynamic-slope';
import { FluidSeparation } from '../../../sph/original/scenarios/fluid-separation';
import { Scenario } from '../../../sph/original/scenarios/scenario';
import { WetDamBreak } from '../../../sph/original/scenarios/wet-dam-break';

@Component({
  selector: 'websph-settings-scenario',
  templateUrl: 'scenario.html',
})
export class ScenarioComponent {
  public scenarios: Array<Scenario> = [
    new WetDamBreak(),
    new DryDamBreak(),
    new FluidSeparation(),
    new ConstantSlope(),
    new DynamicSlope(),
    new CollapsingWaterColumn(),
  ];
  private _activeScenario: Scenario = this.scenarios[0];
  public get activeScenario() {
    return this._activeScenario;
  }

  public set activeScenario(s: Scenario) {
    this._activeScenario = s;
  }

  @Output() changeScenarioNotify: EventEmitter<Scenario> = new EventEmitter<Scenario>();

  public onChangeScenario() {
    this.changeScenarioNotify.emit(this._activeScenario);
  }
}
