import { Injectable, signal, Signal, WritableSignal } from '@angular/core';
import {
    WindwoClose,
    WindowMinimise,
    WindowFullscreen,
    WindowUnfullscreen,
    IsWindowFullscreen,
    WindowSetSize,
} from '../../../wailsjs/go/service/Window';

@Injectable({
    providedIn: 'root',
})
export class WindowServicee {
    private isFullscreen: WritableSignal<boolean> = signal(false);
    private isWidgetMode: WritableSignal<boolean> = signal(false);

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
        // this.isWidgetMode.set(true);
        this.isWidgetMode.update((value) => !value);
        WindowSetSize(200, 100).then(() => {});
        console.log('enter widget mode.', this.isWidgetMode());
    }

    exitWidgetMode() {
        this.isWidgetMode.set(false);

        if (this.isFullscreen()) {
            this.windowFullscreen();
            return;
        }

        WindowSetSize(500, 784).then(() => {});
    }

    windowClose() {
        WindwoClose().then(() => {});
    }

    windowFullscreen() {
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
