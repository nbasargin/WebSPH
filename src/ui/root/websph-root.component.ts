import {Component, ViewChild, OnInit} from "@angular/core";
import {Controller} from "../Controller";
import {SettingsComponent} from "../settings/settings.component";
import {Defaults} from "../../util/Defaults";

@Component({
	selector: 'websph-root',
	templateUrl: 'websph-root.component.html',
	styleUrls: ['websph-root.component.css']
})
export class WebSphRootComponent implements OnInit {

	// version
	public version = Defaults.VERSION;

	// settings and controller
	@ViewChild('settings') settings : SettingsComponent;
	public controller : Controller;

	constructor() {

	}

	ngOnInit(): void {
		let defaultSimOpts = Defaults.getDefaultSimulationOptions();
		let defaultRendOpts = Defaults.getDefaultRendererOptions();

		this.controller = new Controller(this.settings, defaultSimOpts, defaultRendOpts);
		this.settings.setUIStateFromOptions(defaultSimOpts, defaultRendOpts);
	}


}
