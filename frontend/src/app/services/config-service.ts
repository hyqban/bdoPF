import { inject, Injectable, provideAppInitializer, signal, WritableSignal } from '@angular/core';
import { AppWindow, Config } from '../shared/models/model';
import { ReadConfig } from '../../../wailsjs/go/service/Config';

@Injectable({
    providedIn: 'root',
})
export class ConfigService {
    appName = signal('');
    version = signal('');
    theme = signal('');
    locale = signal('');
    window: WritableSignal<AppWindow> = signal<AppWindow>({
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
    });

    loadConfig() {
        ReadConfig().then((res: Config) => {
            this.appName.set(res.appName);
            this.version.set(res.version);
            this.theme.set(res.theme);
            this.locale.set(res.locale);
            this.window.update((el) => {
                el.onTop = res.window.onTop;
                el.width = res.window.width;
                el.height = res.window.height;
                el.maxWidth = res.window.maxWidth;
                el.maxHeight = res.window.maxHeight;
                el.minWidth = res.window.minWidth;
                el.minHeight = res.window.minHeight;
                el.isFullScreen = res.window.isFullScreen;
                el.isWidgetMode = res.window.isWidgetMode;
                el.defaultWidgetWidth = res.window.defaultWidgetWidth;
                el.defaultWidgetHeight = res.window.defaultWidgetHeight;
                el.widgetWidth = res.window.widgetWidth;
                el.widgetHeight = res.window.widgetHeight;
                return { ...el };
            });
        });
    }
}

export function providerConfig() {
    return provideAppInitializer(() => {
        const config = inject(ConfigService);
        return config.loadConfig();
    });
}
