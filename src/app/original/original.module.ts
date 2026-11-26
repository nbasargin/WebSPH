import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MiscComponent } from './settings/misc';
import { RenderingComponent } from './settings/rendering';
import { ScenarioComponent } from './settings/scenario';
import { SettingsComponent } from './settings/settings';
import { SimControlComponent } from './settings/sim-control';
import { SimOptionsComponent } from './settings/sim-options';
import { TimeSteppingComponent } from './settings/time-stepping';

import { WebSphRootComponent } from './page-original';


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
