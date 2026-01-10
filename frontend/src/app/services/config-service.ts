import { inject, Injectable, provideAppInitializer, signal, WritableSignal } from '@angular/core';
import { AppWindow, Config } from '../shared/models/model';
import { ReadConfig } from '../../../wailsjs/go/service/Config';

@Injectable({
    providedIn: 'root',
})
export class ConfigService {
    config: WritableSignal<Config> = signal<Config>({
        appName: '',
        version: '',
        theme: '',
        locale: '',
        newVersion: {
            version: "",
            download: false,
            downloadUrl: ""
        },
        window: {
            onTop: false,
            width: 600,
            height: 768,
            maxWidth: 1920,
            maxHeight: 1080,
            minWidth: 420,
            minHeight: 560,
            isFullScreen: false,
            isWidgetMode: false,
            defaultWidgetWidth: 200,
            defaultWidgetHeight: 100,
            widgetWidth: 200,
            widgetHeight: 100,
        },
    });

    loadConfig() {
        ReadConfig().then((res: Config) => {
            localStorage.setItem('locale', res.locale);
            this.config.set(res);
        });
    }

    updateSignalField<T, K extends keyof T>(signal: WritableSignal<T>, field: K, value: T[K]) {
        signal.update((state) => ({
            ...state,
            [field]: value,
        }));
    }

    submitFieldUpdate() {
        return this.config();
    }
}

export function providerConfig() {
    return provideAppInitializer(() => {
        const config = inject(ConfigService);
        return config.loadConfig();
    });
}
