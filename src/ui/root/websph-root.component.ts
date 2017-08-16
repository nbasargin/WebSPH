import {Component, ViewChild, OnInit} from "@angular/core";
import {Controller} from "../Controller";
import {SettingsComponent} from "../settings/settings.component";

@Component({
	selector: 'websph-root',
	templateUrl: 'websph-root.component.html',
	styleUrls: ['websph-root.component.css']
})
export class WebSphRootComponent implements OnInit {

	@ViewChild('settings') settings : SettingsComponent;

	constructor() {
	}

	public controller : Controller;

	ngOnInit(): void {
		this.controller = new Controller(this.settings);
	}


}
