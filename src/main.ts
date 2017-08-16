import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { WebSphModule } from "./ui/root/websph.module";
//  enableProdMode();

platformBrowserDynamic().bootstrapModule(WebSphModule);
//platformBrowserDynamic().bootstrapModule(AppModule);
//platformBrowserDynamic().bootstrapModule(CommunicationModule);
//platformBrowserDynamic().bootstrapModule(RadioButtonsModule);
