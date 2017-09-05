import {Component, Output, EventEmitter} from "@angular/core";
import {Scenario} from "../../util/scenarios/Scenario";
import {WetDamBreak} from "../../util/scenarios/WetDamBreak";
import {DryDamBreak} from "../../util/scenarios/DryDamBreak";
import {FluidSeparation} from "../../util/scenarios/FluidSeparation";

@Component({
	selector: 'websph-settings-scenario',
	templateUrl: 'scenario.component.html'
})
export class ScenarioComponent {

	public scenarios : Array<Scenario> = [
		new WetDamBreak(),
		new DryDamBreak(),
		new FluidSeparation()
	];
	private _activeScenario : Scenario = this.scenarios[0];
	public get activeScenario() {
		return this._activeScenario;
	}
	public set activeScenario(s : Scenario) {
		this._activeScenario = s;
	}


	@Output() changeScenarioNotify : EventEmitter<Scenario> = new EventEmitter<Scenario>();
	public onChangeScenario() {
		this.changeScenarioNotify.emit(this._activeScenario);
	}




}
