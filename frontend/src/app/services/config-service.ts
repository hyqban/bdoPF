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
            // this.config.update((el) => {
            //     el.appName = res.appName;
            //     el.version = res.version;
            //     el.theme = res.theme;
            //     el.locale = res.locale;
            //     el.window.onTop = res.window.onTop;
            //     el.window.width = res.window.width;
            //     el.window.height = res.window.height;
            //     el.window.maxWidth = res.window.maxWidth;
            //     el.window.maxHeight = res.window.maxWidth;
            //     el.window.minWidth = res.window.minWidth;
            //     el.window.minHeight = res.window.minHeight;
            //     el.window.isFullScreen = res.window.isFullScreen;
            //     el.window.isWidgetMode = res.window.isWidgetMode;
            //     el.window.defaultWidgetWidth = res.window.defaultWidgetWidth;
            //     el.window.defaultWidgetHeight = res.window.defaultWidgetHeight;
            //     el.window.widgetWidth = res.window.widgetWidth;
            //     el.window.widgetHeight = res.window.widgetHeight;

            //     return { ...el };
            // });
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
