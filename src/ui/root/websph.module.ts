import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MiscComponent } from '../settings/misc.component';
import { RenderingComponent } from '../settings/rendering.component';
import { ScenarioComponent } from '../settings/scenario.component';
import { SettingsComponent } from '../settings/settings.component';
import { SimControlComponent } from '../settings/sim-control.component';
import { SimOptionsComponent } from '../settings/sim-options.component';
import { TimeSteppingComponent } from '../settings/time-stepping.component';

import { WebSphRootComponent } from './websph-root.component';


@NgModule({
    declarations: [
        WebSphRootComponent,
        SettingsComponent,
        ScenarioComponent,
        SimControlComponent,
        SimOptionsComponent,
        TimeSteppingComponent,
        RenderingComponent,
        MiscComponent
    ],
    imports: [
        BrowserModule,
        FormsModule
    ],
    providers: [],
    bootstrap: [WebSphRootComponent]
})
export class WebSphModule {

}
