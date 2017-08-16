import {SettingsComponent} from "./settings/settings.component";

export class Controller {

	public settingsUI : SettingsComponent;

	private calculatedDtDynStable : number = 0;
	private calculatedDtDynFast : number = 1;

	public constructor(settingsComponent : SettingsComponent) {
		if (!settingsComponent) {
			console.log("[!!] Controller constructor: settingsComponent is not set!");
		}

		this.settingsUI = settingsComponent;
		//this.oneStep();
	}

	public oneStep() {
		console.log("one step start, using dt: " + this.settingsUI.getFinalDt());
		this.settingsUI.setDtDynFast(++this.calculatedDtDynFast);
		this.settingsUI.setDtDynStable(++this.calculatedDtDynStable);
		console.log("one step done, new dt set");
	}

	public resetParticles(numParticles : number) {

	}


}
