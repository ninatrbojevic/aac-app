import {provideAnimations} from '@angular/platform-browser/animations';
import {bootstrapApplication} from '@angular/platform-browser';
import {AppComponent} from './app/app.component';
import {appConfig} from './app/app.config';
import {providePrimeNG} from 'primeng/config';
import Aura from '@primeng/themes/aura';
import {provideHttpClient} from '@angular/common/http';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers ?? []),
    provideAnimations(),
    provideHttpClient(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    })
  ]
}).catch(err => console.error(err));