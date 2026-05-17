import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent as App } from './app/app';
import 'zone.js';

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
