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
import { WindowSizeChange } from '../shared/models/model';
import { ConfigService } from './config-service';
import { ReceiveConfigUpdate } from '../../../wailsjs/go/service/Config';

@Injectable({
    providedIn: 'root',
})
export class WindowServicee {
    constructor(private configService: ConfigService) {}
    private isFullscreen: WritableSignal<boolean> = signal(false);
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
            return { ...el };
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
        return this.configService.config().window.isWidgetMode;
        // return this.isWidgetMode;
    }

    // toggleIsWidgetMode(value: boolean) {
    //     this.configService.config.update(el => {
    //         window: {

    //         }
    //     });
    //     this.isWidgetMode.set(value);
    // }

    storeWindowSize() {
        WindowGetSize().then((res) => {
            this.windowSizeChange.update((el) => {
                el.widthBeforeEnterWidget = res['w'];
                el.heightBeforeEnterWidget = res['h'];
                el.minWidthBeforeEnterWidget = this.configService.config().window.minWidth;
                el.minHeightBeforeEnterWidget = this.configService.config().window.minHeight;

                return { ...el };
            });
        });
    }

    async enterWidgetMode() {
        if (!this.isFullscreen()) {
            this.getWindowSize();
        }
        // this.configService.config().window.isWidgetMode = true;
        // await ReceiveConfigUpdate(this.configService.config());

        const res1 = await WindowGetSize();

        this.windowSizeChange.update((el) => {
            el.widthBeforeEnterWidget = res1['w'];
            el.heightBeforeEnterWidget = res1['h'];
            el.minWidthBeforeEnterWidget = this.configService.config().window.minWidth;
            el.minHeightBeforeEnterWidget = this.configService.config().window.minWidth;

            return { ...el };
        });
        // this.isWidgetMode.update((value) => !value);

        this.configService.config.update((el) => ({
            ...el,
            window: {
                ...el.window,
                isWidgetMode: true,
            },
        }));
        console.log('enter: ', this.configService.config().window);
        await ReceiveConfigUpdate(this.configService.config());

        await WindowSetMinSize(
            this.configService.config().window.widgetWidth,
            this.configService.config().window.widgetHeight,
        );
        await WindowSetSize(
            this.configService.config().window.widgetWidth,
            this.configService.config().window.widgetHeight,
        );
    }

    async exitWidgetMode() {
        // this.isWidgetMode.set(false);
        this.configService.config.update((el) => ({
            ...el,
            window: {
                ...el.window,
                isWidgetMode: false,
            },
        }));

        console.log('exit: ', this.configService.config().window);

        await ReceiveConfigUpdate(this.configService.config());

        if (this.isFullscreen()) {
            this.isFullscreen.set(this.isFullscreen());

            await WindowSetSize(
                this.windowSizeChange().widthBeforeEnterWidget,
                this.windowSizeChange().heightBeforeEnterWidget,
            );
            await WindowSetMinSize(
                this.windowSizeChange().minWidthBeforeEnterWidget,
                this.windowSizeChange().minHeightBeforeEnterWidget,
            );
            return;
        }

        await WindowSetSize(
            this.windowSizeChange().widthBeforeEnterWidget,
            this.windowSizeChange().heightBeforeEnterWidget,
        );
        await WindowSetMinSize(
            this.windowSizeChange().minWidthBeforeEnterWidget,
            this.windowSizeChange().minHeightBeforeEnterWidget,
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
