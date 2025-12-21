import { Injectable, signal, Signal, WritableSignal } from '@angular/core';
import {
    WindwoClose,
    WindowMinimise,
    WindowFullscreen,
    WindowUnfullscreen,
    IsWindowFullscreen,
    WindowSetSize,
    WindowGetSize,
    WindowSetMinSize,
    WindowSetAlwaysOnTop,
} from '../../../wailsjs/go/service/Window';
import { WindowSize, WindowSizeChange } from '../shared/models/model';
import { ConfigService } from './config-service';

@Injectable({
    providedIn: 'root',
})
export class WindowServicee {
    constructor(private config: ConfigService) {}
    private isFullscreen: WritableSignal<boolean> = signal(false);
    private isWidgetMode: WritableSignal<boolean> = signal(false);
    private onTop: boolean = false;
    private windowSizeChange: WritableSignal<WindowSizeChange> = signal<WindowSizeChange>({
        widthBeforeEnterWidget: 0,
        heightBeforeEnterWidget: 0,
        minWidthBeforeEnterWidget: 0,
        minHeightBeforeEnterWidget: 0,
    });

    setWindowOnTop() {
        this.onTop = !this.onTop;
        console.log('onTop: ', this.onTop);

        WindowSetAlwaysOnTop(this.onTop);
    }

    async getWindowSize() {
        const res = await WindowGetSize();
        this.windowSizeChange.update((el) => {
            el.widthBeforeEnterWidget = res['w'];
            el.heightBeforeEnterWidget = res['h'];
            return el;
        });
    }

    getIsFullscreen() {
        IsWindowFullscreen().then((res) => {
            if (res) {
                this.isFullscreen.set(true);
            }
        });
        return this.isFullscreen;
    }

    toggleIsFullscreen(value: boolean) {
        this.isFullscreen.set(value);
    }

    getIsWidgetMode() {
        return this.isWidgetMode;
    }

    toggleIsWidgetMode(value: boolean) {
        this.isWidgetMode.set(value);
    }

    storeWindowSize() {
        WindowGetSize().then((res) => {
            this.windowSizeChange.update((el) => {
                el.widthBeforeEnterWidget = res['w'];
                el.heightBeforeEnterWidget = res['h'];
                el.minWidthBeforeEnterWidget = this.config.window().minWidth;
                el.minHeightBeforeEnterWidget = this.config.window().minHeight;

                return el;
            });
        });

        // WindowSetMinSize().then(() => {})
    }

    async enterWidgetMode() {
        if (!this.isFullscreen()) {
            this.getWindowSize();
        }
        // this.isWidgetMode.set(true);
        const res1 = await WindowGetSize();
        // console.log(res1);

        this.windowSizeChange.update((el) => {
            el.widthBeforeEnterWidget = res1['w'];
            el.heightBeforeEnterWidget = res1['h'];
            el.minWidthBeforeEnterWidget = this.config.window().minWidth;
            el.minHeightBeforeEnterWidget = this.config.window().minWidth;

            return el;
        });
        this.isWidgetMode.update((value) => !value);
        await WindowSetMinSize(this.config.window().widgetWidth, this.config.window().widgetHeight);
        await WindowSetSize(this.config.window().widgetWidth, this.config.window().widgetHeight);
    }

    async exitWidgetMode() {
        this.isWidgetMode.set(false);

        if (this.isFullscreen()) {
            // console.log('----', this.isFullscreen());

            this.isFullscreen.set(this.isFullscreen());

            await WindowSetSize(
                this.windowSizeChange().widthBeforeEnterWidget,
                this.windowSizeChange().heightBeforeEnterWidget
            );
            await WindowSetMinSize(
                this.windowSizeChange().minWidthBeforeEnterWidget,
                this.windowSizeChange().minHeightBeforeEnterWidget
            );
            // this.windowFullscreen();
            return;
        }

        // console.log('++++', this.isFullscreen());
        // WindowSetSize(500, 784).then(() => {});
        await WindowSetSize(
            this.windowSizeChange().widthBeforeEnterWidget,
            this.windowSizeChange().heightBeforeEnterWidget
        );
        await WindowSetMinSize(
            this.windowSizeChange().minWidthBeforeEnterWidget,
            this.windowSizeChange().minHeightBeforeEnterWidget
        );
    }

    windowClose() {
        WindwoClose().then(() => {});
    }

    async windowFullscreen() {
        await this.getWindowSize();
        await WindowFullscreen();
        this.isFullscreen.set(true);
    }

    async windowUnfullscreen() {
        let fs: boolean = await IsWindowFullscreen();

        if (fs) {
            this.isFullscreen.set(true);
        }

        await WindowUnfullscreen();
        this.isFullscreen.set(false);
    }

    windowMinimise() {
        WindowMinimise().then(() => {});
    }
}
