import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Defaults } from '../../sph/original/util/defaults';
import { Controller } from './controller';
import { SettingsComponent } from './settings/settings';

@Component({
  selector: 'websph-root',
  templateUrl: 'page-original.html',
  styleUrls: ['page-original.scss'],
})
export class WebSphRootComponent implements AfterViewInit {
  // version
  public version = Defaults.VERSION;

  // settings and controller
  @ViewChild('settings') settings: SettingsComponent;
  public controller: Controller;

  constructor() {}

  ngAfterViewInit(): void {
    setTimeout(() => {
      let defaultSimOpts = Defaults.getDefaultSimulationOptions();
      let defaultRendOpts = Defaults.getDefaultRendererOptions();

      this.controller = new Controller(this.settings, defaultSimOpts, defaultRendOpts);
      this.settings.setUIStateFromOptions(defaultSimOpts, defaultRendOpts);
    }, 0);
  }
}
