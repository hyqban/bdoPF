import {
    ApplicationConfig,
    provideAppInitializer,
    provideBrowserGlobalErrorListeners,
    provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { routes } from './app.routes';
import { providerI18n } from './services/i18n-service';
import { providerConfig } from './services/config-service';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideZonelessChangeDetection(),
        provideRouter(routes, withHashLocation()),
        providerConfig(),
        providerI18n(),
        { provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: { duration: 2000}}
    ],
};
