import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Defaults } from '../../util/Defaults';
import { Controller } from '../Controller';
import { SettingsComponent } from '../settings/settings.component';

@Component({
    selector: 'websph-root',
    templateUrl: 'websph-root.component.html',
    styleUrls: ['websph-root.component.css']
})
export class WebSphRootComponent implements AfterViewInit {

    // version
    public version = Defaults.VERSION;

    // settings and controller
    @ViewChild('settings') settings: SettingsComponent;
    public controller: Controller;

    constructor() {

    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            let defaultSimOpts = Defaults.getDefaultSimulationOptions();
            let defaultRendOpts = Defaults.getDefaultRendererOptions();

            this.controller = new Controller(this.settings, defaultSimOpts, defaultRendOpts);
            this.settings.setUIStateFromOptions(defaultSimOpts, defaultRendOpts);
        }, 0);
    }


}
