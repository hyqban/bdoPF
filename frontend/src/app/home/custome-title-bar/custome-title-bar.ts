import { Component, signal, WritableSignal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { WindowServicee } from '../../services/window-servicee';

@Component({
    selector: 'app-custome-title-bar',
    imports: [MatIconModule],
    templateUrl: './custome-title-bar.html',
    styleUrl: './custome-title-bar.scss',
})
export class CustomeTitleBar {
    protected isFullscreen!: WritableSignal<boolean>;

    constructor(private windowService: WindowServicee) {
        this.isFullscreen = this.windowService.getIsFullscreen();
    }

    protected enterWidgetMode() {
        this.windowService.enterWidgetMode();
    }

    protected windowClose() {
        this.windowService.windowClose();
    }

    protected windowFullscreen() {
        this.windowService.windowFullscreen();
    }

    protected windowUnfullscreen() {
        this.windowService.windowUnfullscreen();
    }

    protected windowMinimise() {
        this.windowService.windowMinimise();
    }
}
