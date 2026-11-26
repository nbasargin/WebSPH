import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app';
import { routes } from './app/routes';

bootstrapApplication(AppComponent, {
  providers: [provideBrowserGlobalErrorListeners(), provideRouter(routes)],
}).catch((err) => console.error(err));
