import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { RemoteEntryComponent } from './app/remote-entry/entry';
import { provideRouter } from '@angular/router';

bootstrapApplication(RemoteEntryComponent, {
  providers: [
    ...appConfig.providers,
    provideRouter([{ path: '', component: RemoteEntryComponent }])
  ]
}).catch((err) => console.error(err));
