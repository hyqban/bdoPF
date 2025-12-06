import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { ReadLocales } from '../wailsjs/go/service/FileHandler';
import { providerI18n } from './app/services/i18n-service';

async function loadInitialLocales() {
    const data = await ReadLocales();
    console.log(data);

    return data;
}

loadInitialLocales().then((initialLocales) => {
    bootstrapApplication(App, {
        ...appConfig,
        providers: [...(appConfig.providers ?? []), providerI18n(initialLocales)],
    });
});
// bootstrapApplication(App, appConfig).catch((err) => console.error(err));
