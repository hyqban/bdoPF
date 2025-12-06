import { Injectable, signal, Signal, WritableSignal } from '@angular/core';
import {
    WindwoClose,
    WindowMinimise,
    WindowFullscreen,
    WindowUnfullscreen,
    IsWindowFullscreen,
    WindowSetSize,
    WindowGetSize,
} from '../../../wailsjs/go/service/Window';
import { WindowSize } from '../shared/models/model';

@Injectable({
    providedIn: 'root',
})
export class WindowServicee {
    private isFullscreen: WritableSignal<boolean> = signal(false);
    private isWidgetMode: WritableSignal<boolean> = signal(false);
    private windowSize: WritableSignal<WindowSize> = signal<WindowSize>({
        w: 0,
        h: 0,
    });

    getWindowSize() {
        WindowGetSize().then((res) => {
            this.windowSize.update((currentSize) => ({
                ...currentSize,
                w: res['w'],
                h: res['h'],
            }));
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

    enterWidgetMode() {
        if (!this.isFullscreen()) {
            this.getWindowSize();
        }
        // this.isWidgetMode.set(true);
        this.isWidgetMode.update((value) => !value);
        WindowSetSize(200, 100).then(() => {});
    }

    // exitWidgetMode() {
    //     this.isWidgetMode.set(false);

    //     if (this.isFullscreen()) {
    //         this.windowFullscreen();
    //         return;
    //     }

    //     WindowSetSize(500, 784).then(() => {});
    // }

    exitWidgetMode() {
        this.isWidgetMode.set(false);

        if (this.isFullscreen()) {
            this.isFullscreen.set(false);

            WindowSetSize(this.windowSize()['w'], this.windowSize()['h']).then(() => {});
            // this.windowFullscreen();
            return;
        }

        // WindowSetSize(500, 784).then(() => {});
        WindowSetSize(this.windowSize()['w'], this.windowSize()['h']).then(() => {});
    }

    windowClose() {
        WindwoClose().then(() => {});
    }

    windowFullscreen() {
        this.getWindowSize();
        WindowFullscreen().then(() => {});
        this.isFullscreen.set(true);
    }

    async windowUnfullscreen() {
        let fs: boolean = await IsWindowFullscreen();

        if (fs) {
            this.isFullscreen.set(true);
        }

        WindowUnfullscreen().then(() => {});
        this.isFullscreen.set(false);
    }

    windowMinimise() {
        WindowMinimise().then(() => {});
    }
}
